import Icon from './Icon.jsx'

// Escolha da voz do Raly (feminina ou masculina), velocidade e tom. Fica salva neste navegador.
export default function PersonalizarVoz({ voz, compacto = false }) {
  const { perfil, setPerfil, vozEscolhida, suportaFala } = voz
  const nome = vozEscolhida.voz?.name
  const perfisLocais = voz.localPronto ? Object.entries(voz.local.perfis).filter(([, v]) => v.pronto) : []
  const perfilAtivo = perfisLocais.find(([id]) => id === perfil.perfilLocal)?.[0] || perfisLocais[0]?.[0]
  if (perfisLocais.length) {
    return (
      <div className={`voz-config ${compacto ? 'voz-config--compacto' : ''}`}>
        <fieldset className="voz-config__genero" style={{ flexWrap: 'wrap' }}>
          <legend>Voz do Raly (offline)</legend>
          {perfisLocais.map(([id, v]) => (
            <label key={id} className={`voz-config__opcao ${perfilAtivo === id ? 'voz-config__opcao--ativa' : ''}`} title={v.descricao} style={{ flexBasis: compacto ? '45%' : '22%' }}>
              <input type="radio" name={`perfil-voz${compacto ? '-dock' : ''}`} checked={perfilAtivo === id} onChange={() => { setPerfil({ perfilLocal: id }); setTimeout(() => voz.falar(`Olá, eu sou o ${v.rotulo}.`), 0) }} />
              <span>{v.rotulo.replace('Raly ', '')}</span>
            </label>
          ))}
        </fieldset>
        {!compacto && (
          <>
            <label className="campo">
              <span>Velocidade: {perfil.velocidade.toFixed(1)}×</span>
              <input type="range" min="0.7" max="1.4" step="0.1" value={perfil.velocidade} onChange={(e) => setPerfil({ velocidade: Number(e.target.value) })} />
            </label>
            <div className="acoes">
              <button type="button" className="btn btn--secundario" onClick={() => voz.falar('Olá! Eu sou o Raly. Posso registrar relatos, abrir telas e organizar as informações para a sua revisão.')}><Icon nome="mic" tamanho={16} /> Ouvir a voz</button>
            </div>
            <p className="texto-suave">Voz neural local (Piper), sem internet. {voz.local.llm?.ok ? <>Modelo local: <strong>{voz.local.llm.modelo}</strong>.</> : 'Ollama não encontrado: respostas por regras.'}</p>
          </>
        )}
      </div>
    )
  }
  return (
    <div className={`voz-config ${compacto ? 'voz-config--compacto' : ''}`}>
      <fieldset className="voz-config__genero" disabled={!suportaFala}>
        <legend>Voz do Raly</legend>
        {['feminina', 'masculina'].map((g) => (
          <label key={g} className={`voz-config__opcao ${perfil.genero === g ? 'voz-config__opcao--ativa' : ''}`}>
            <input type="radio" name={`genero-voz${compacto ? '-dock' : ''}`} checked={perfil.genero === g} onChange={() => { setPerfil({ genero: g }); setTimeout(() => voz.falar(g === 'feminina' ? 'Olá, eu sou o Raly, com voz feminina.' : 'Olá, eu sou o Raly, com voz masculina.'), 0) }} />
            <span>{g === 'feminina' ? 'Feminina' : 'Masculina'}</span>
          </label>
        ))}
      </fieldset>
      {!compacto && (
        <>
          <label className="campo">
            <span>Velocidade: {perfil.velocidade.toFixed(1)}×</span>
            <input type="range" min="0.7" max="1.4" step="0.1" value={perfil.velocidade} disabled={!suportaFala} onChange={(e) => setPerfil({ velocidade: Number(e.target.value) })} />
          </label>
          <label className="campo">
            <span>Tom: {perfil.tom.toFixed(1)}</span>
            <input type="range" min="0.6" max="1.4" step="0.1" value={perfil.tom} disabled={!suportaFala} onChange={(e) => setPerfil({ tom: Number(e.target.value) })} />
          </label>
          <div className="acoes">
            <button type="button" className="btn btn--secundario" disabled={!suportaFala} onClick={() => voz.falar('Olá! Eu sou o Raly. Posso registrar relatos, abrir telas e organizar as informações para a sua revisão.')}><Icon nome="mic" tamanho={16} /> Ouvir a voz</button>
          </div>
          <p className="texto-suave">
            {nome ? <>Voz em uso: <strong>{nome}</strong>. </> : 'Nenhuma voz em português encontrada. '}
            {nome && !vozEscolhida.exato && 'Este computador não tem voz desse gênero em português; o tom foi ajustado para aproximar. Instale mais vozes pt-BR no sistema para ter as duas.'}
          </p>
        </>
      )}
    </div>
  )
}
