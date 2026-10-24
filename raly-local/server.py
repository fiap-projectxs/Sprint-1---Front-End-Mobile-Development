"""Servidor local do Raly: voz (Piper, 4 perfis) e ponte para o Ollama.
Tudo em 127.0.0.1, sem internet. Uso: python server.py
Variáveis opcionais: RALY_PORTA (8765), RALY_MODELO (nome do modelo do Ollama),
OLLAMA_URL (http://127.0.0.1:11434)."""
import io
import json
import os
import threading
import urllib.error
import urllib.request
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

AQUI = Path(__file__).parent
CFG = json.loads((AQUI / "perfis.json").read_text(encoding="utf-8"))
PERFIS = CFG["perfis"]
PORTA = int(os.environ.get("RALY_PORTA", "8765"))
OLLAMA = os.environ.get("OLLAMA_URL", CFG["llm"]["url"]).rstrip("/")
MODELO_FIXO = os.environ.get("RALY_MODELO") or CFG["llm"].get("modelo") or ""
ORIGENS_OK = ("http://localhost:", "http://127.0.0.1:", "http://[::1]:")

STT_MODELO = os.environ.get("RALY_STT_MODELO", "base")  # tiny, base, small (small = mais preciso e mais pesado)
_vozes = {}
_trava = threading.Lock()
_stt = None
_trava_stt = threading.Lock()


def stt_instalado():
    import importlib.util
    return importlib.util.find_spec("faster_whisper") is not None


def carregar_stt():
    global _stt
    with _trava_stt:
        if _stt is None:
            from faster_whisper import WhisperModel  # import tardio: o servidor sobe mesmo sem ele

            _stt = WhisperModel(STT_MODELO, device="cpu", compute_type="int8", download_root=str(AQUI / "models" / "whisper"))
        return _stt


def transcrever(audio_bytes):
    """Reconhecimento de voz offline (Whisper). Aceita webm/ogg/wav (o navegador grava webm/opus)."""
    modelo = carregar_stt()
    segmentos, _ = modelo.transcribe(io.BytesIO(audio_bytes), language="pt", vad_filter=True, beam_size=1,
                                     condition_on_previous_text=False)
    return " ".join(s.text.strip() for s in segmentos).strip()


def carregar_voz(nome):
    with _trava:
        if nome not in _vozes:
            from piper import PiperVoice  # import tardio: o servidor sobe mesmo sem piper

            onnx = AQUI / "models" / f"{nome}.onnx"
            if not onnx.exists():
                raise FileNotFoundError(f"voz não baixada: {onnx.name} (rode baixar_modelos.py)")
            _vozes[nome] = PiperVoice.load(str(onnx))
        return _vozes[nome]


def sintetizar(perfil_id, texto):
    from piper import SynthesisConfig

    perfil = PERFIS[perfil_id]
    voz = carregar_voz(perfil["voz"])
    cfg = SynthesisConfig(length_scale=1.0 / perfil["velocidade"], noise_scale=perfil["variacao"])
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        voz.synthesize_wav(texto, wav, syn_config=cfg)
    return buf.getvalue()


def ollama(caminho, corpo=None, timeout=120):
    req = urllib.request.Request(
        OLLAMA + caminho,
        data=None if corpo is None else json.dumps(corpo).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def modelo_ollama():
    """Usa RALY_MODELO se definido; senão o primeiro modelo de chat instalado no seu Ollama."""
    if MODELO_FIXO:
        return MODELO_FIXO
    nomes = [m["name"] for m in ollama("/api/tags", timeout=3).get("models", [])]
    chat = [n for n in nomes if not any(x in n.lower() for x in ("embed", "bge", "minilm"))]
    return (chat or nomes or [None])[0]


def conversar(mensagem, historico):
    modelo = modelo_ollama()
    if not modelo:
        raise RuntimeError("nenhum modelo instalado no Ollama")
    msgs = [{"role": "system", "content": CFG["llm"]["sistema"]}]
    for h in (historico or [])[-6:]:
        if h.get("papel") in ("user", "assistant") and h.get("texto"):
            msgs.append({"role": h["papel"], "content": str(h["texto"])[:600]})
    msgs.append({"role": "user", "content": mensagem[:800]})
    r = ollama("/api/chat", {"model": modelo, "messages": msgs, "stream": False,
                             "options": {"temperature": 0.3, "num_predict": 160}})
    return r["message"]["content"].strip(), modelo


def status():
    vozes = {pid: (AQUI / "models" / f"{p['voz']}.onnx").exists() for pid, p in PERFIS.items()}
    try:
        llm = {"ok": True, "modelo": modelo_ollama()}
    except (urllib.error.URLError, OSError, ValueError) as e:
        llm = {"ok": False, "erro": str(e)}
    stt = {"ok": stt_instalado(), "modelo": STT_MODELO}
    return {"stt": stt, "perfis": {k: {"rotulo": v["rotulo"], "descricao": v["descricao"], "tom": v.get("tom", 1.0), "pronto": vozes[k]} for k, v in PERFIS.items()},
            "llm": llm}


class H(BaseHTTPRequestHandler):
    def _cors(self):
        o = self.headers.get("Origin", "")
        if o.startswith(ORIGENS_OK):  # só páginas locais podem usar este servidor
            self.send_header("Access-Control-Allow-Origin", o)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _enviar(self, codigo, corpo, tipo="application/json"):
        if not isinstance(corpo, bytes):
            corpo = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self._cors()
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def do_OPTIONS(self):
        self._enviar(204, b"")

    def do_GET(self):
        if self.path == "/api/status":
            self._enviar(200, status())
        else:
            self._enviar(404, {"erro": "não encontrado"})

    def do_POST(self):
        try:
            n = int(self.headers.get("Content-Length", "0"))
            if self.path == "/api/stt":
                if n <= 0 or n > 10_000_000:
                    return self._enviar(400, {"erro": "áudio vazio ou grande demais"})
                return self._enviar(200, {"texto": transcrever(self.rfile.read(n))})
            dados = json.loads(self.rfile.read(n) or b"{}")
            if self.path == "/api/tts":
                perfil = dados.get("perfil", "padrao")
                texto = str(dados.get("texto", "")).strip()[:1200]
                if perfil not in PERFIS or not texto:
                    return self._enviar(400, {"erro": "perfil ou texto inválido"})
                self._enviar(200, sintetizar(perfil, texto), "audio/wav")
            elif self.path == "/api/chat":
                texto, modelo = conversar(str(dados.get("mensagem", "")), dados.get("historico"))
                self._enviar(200, {"texto": texto, "modelo": modelo})
            else:
                self._enviar(404, {"erro": "não encontrado"})
        except Exception as e:  # erro vira JSON para o site cair no plano B
            self._enviar(500, {"erro": f"{type(e).__name__}: {e}"})

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    print(f"Raly local em http://127.0.0.1:{PORTA}")
    print(json.dumps(status(), ensure_ascii=False, indent=2))
    ThreadingHTTPServer(("127.0.0.1", PORTA), H).serve_forever()
