"""Baixa as 4 vozes Piper pt-BR para raly-local/models. Roda uma vez, com internet.
Depois disso o Raly funciona 100% offline."""
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

AQUI = Path(__file__).parent
BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main"
cfg = json.loads((AQUI / "perfis.json").read_text(encoding="utf-8"))
destino = AQUI / "models"
destino.mkdir(exist_ok=True)

falhou = False
for nome, caminho in cfg["vozes"].items():
    for ext in (".onnx", ".onnx.json"):
        arq = destino / f"{nome}{ext}"
        if arq.exists() and arq.stat().st_size > 0:
            print(f"ok (já existe) {arq.name}")
            continue
        url = f"{BASE}/{caminho}/{nome}{ext}"
        print(f"baixando {url}")
        try:
            urllib.request.urlretrieve(url, arq)
        except urllib.error.URLError as e:
            print(f"  FALHOU: {e}")
            arq.unlink(missing_ok=True)
            falhou = True
# Modelo de reconhecimento de voz offline (Whisper). Baixa uma vez (~150 MB para "base").
try:
    import os
    from faster_whisper import WhisperModel

    nome = os.environ.get("RALY_STT_MODELO", "base")
    print(f"baixando modelo de reconhecimento de voz: {nome}")
    WhisperModel(nome, device="cpu", compute_type="int8", download_root=str(destino / "whisper"))
except Exception as e:  # noqa: BLE001
    print(f"  FALHOU (reconhecimento offline ficará indisponível): {e}")
    falhou = True

sys.exit(1 if falhou else 0)
