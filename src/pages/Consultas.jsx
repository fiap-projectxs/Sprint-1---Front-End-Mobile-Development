import { useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import CardTrecho from '../components/CardTrecho.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SourceTag from '../components/SourceTag.jsx'
import { Selecao, Texto } from '../components/Campo.jsx'
import { PROCEDIMENTOS, TRECHOS } from '../data/trechos.js'

export default function Consultas() {
  const [busca, setBusca] = useState('')
  const [rodovia, setRodovia] = useState('')
  const rodovias = [...new Set(TRECHOS.map((t) => t.rodovia))]

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return TRECHOS.filter((t) =>
      (!rodovia || t.rodovia === rodovia) &&
      (!q || `${t.nome} ${t.municipio} ${t.observacao} ${t.situacao}`.toLowerCase().includes(q)))
  }, [busca, rodovia])

  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>Consultas · trechos e informações operacionais</h1>
          <p className="texto-suave">Lista de trechos e roteiros de exemplo, vinda de um array fixo em <code>src/data/</code>.</p>
        </div>
      </div>
      <Card>
        <div className="filtros">
          <Texto id="cons-busca" rotulo="Buscar trecho" valor={busca} onChange={setBusca} placeholder="Nome, município ou observação" />
          <Selecao id="cons-rod" rotulo="Rodovia" valor={rodovia} onChange={setRodovia} opcoes={rodovias} />
        </div>
      </Card>

      {lista.length === 0 ? (
        <EmptyState titulo="Nenhum trecho encontrado">Tente outro termo de busca.</EmptyState>
      ) : (
        <div className="grade grade--3">
          {lista.map((t) => <CardTrecho key={t.id} trecho={t} />)}
        </div>
      )}

      <h2 className="secao">Roteiros de exemplo</h2>
      <div className="grade grade--2">
        {PROCEDIMENTOS.map((p) => (
          <Card key={p.id} titulo={p.titulo} acoes={<SourceTag fonte="simulada" />}>
            <p>{p.resumo}</p>
            <p className="texto-suave">Fonte: {p.fonte}. Não é procedimento oficial.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
