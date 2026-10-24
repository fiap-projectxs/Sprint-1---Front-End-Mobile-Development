// Campos de formulário sempre com rótulo visível (acessibilidade).
export function Selecao({ rotulo, valor, onChange, opcoes, todas = 'Todos', id }) {
  const campoId = id || `sel-${rotulo}`
  return (
    <label className="campo" htmlFor={campoId}>
      <span>{rotulo}</span>
      <select id={campoId} value={valor} onChange={(e) => onChange(e.target.value)}>
        {todas !== null && <option value="">{todas}</option>}
        {opcoes.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

export function Texto({ rotulo, valor, onChange, tipo = 'text', placeholder, id, obrigatorio, linhas }) {
  const campoId = id || `txt-${rotulo}`
  return (
    <label className="campo" htmlFor={campoId}>
      <span>{rotulo}{obrigatorio && <abbr title="obrigatório"> *</abbr>}</span>
      {linhas ? (
        <textarea id={campoId} rows={linhas} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} required={obrigatorio} />
      ) : (
        <input id={campoId} type={tipo} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} required={obrigatorio} />
      )}
    </label>
  )
}
