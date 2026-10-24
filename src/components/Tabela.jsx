// Tabela reutilizável: colunas = [{ chave, rotulo, render? }]. Linhas clicáveis por teclado.
export default function Tabela({ colunas, linhas, chaveId = 'id', onLinha, legenda }) {
  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <caption className="sr-only">{legenda}</caption>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.chave} scope="col">{c.rotulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr
              key={l[chaveId]}
              className={onLinha ? 'tabela__linha' : ''}
              tabIndex={onLinha ? 0 : undefined}
              onClick={onLinha ? () => onLinha(l) : undefined}
              onKeyDown={onLinha ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onLinha(l) } } : undefined}
            >
              {colunas.map((c) => (
                <td key={c.chave} data-rotulo={c.rotulo}>{c.render ? c.render(l) : l[c.chave]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
