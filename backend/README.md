# CAD-MED Backend (Express + TypeScript)

API Express com Sequelize e MySQL/MariaDB. Suporta execução local e via Netlify Functions.

## Requisitos
- Node.js 18+
- Banco MySQL/MariaDB acessível

## Variáveis de ambiente (.env)
Crie um arquivo `.env` na raiz do projeto com:

```
DB_HOST=seu_host
DB_PORT=3306
DB_NAME=seu_banco
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
API_PASSWORD=sua_senha_da_api
PORT=3000
```

## Instalação
- npm install

## Desenvolvimento (hot-reload)
- npm run dev

Servidor: http://localhost:3000

## Produção (compilar e executar)
- npm start

## Rotas
- POST /api/pacientes
  - body: { pacientes: User[], password: string }
  - password deve ser igual a API_PASSWORD

## Netlify
- Deploy como Function usando `netlify/functions/api.ts`
- Defina as mesmas variáveis de ambiente no painel do Netlify
