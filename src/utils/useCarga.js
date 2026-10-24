import { useCallback, useEffect, useState } from 'react'

// Simula carregamento e falha de uma "fonte de dados". Não há rede nem backend.
export default function useCarga(ms = 700) {
  const [estado, setEstado] = useState('carregando') // 'carregando' | 'ok' | 'erro'
  useEffect(() => {
    const t = setTimeout(() => setEstado('ok'), ms)
    return () => clearTimeout(t)
  }, [ms])
  const recarregar = useCallback(() => {
    setEstado('carregando')
    setTimeout(() => setEstado('ok'), ms)
  }, [ms])
  const simularErro = useCallback(() => setEstado('erro'), [])
  return { estado, recarregar, simularErro }
}
