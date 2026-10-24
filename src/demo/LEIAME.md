# Dados de demonstração

Tudo aqui é fictício e não aparece na interface do site.

- `usuarios.js`: contas de teste (admin, coordenador, agente, passageiro), com e-mail e senha.
  Só são criadas no navegador em desenvolvimento (`npm run dev`) ou com `VITE_SEED_DEMO=true`.
  Em produção (Railway) a lista começa vazia e a primeira conta criada vira administradora.
- `tickets.js`, `interacoes.js`: tickets e interações de exemplo.

Para zerar as contas no navegador: apague a chave `raly:usuarios:v2` do localStorage.
