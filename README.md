# shrt.fun API

**API de encurtador de URLs com analytics em tempo real e geolocalização.**

Uma plataforma performática para criar URLs curtas, gerar QR codes, e acompanhar engajamentos detalhados por localização, dispositivo e navegador. Ideal para campanhas de marketing, tracking de links e análise de audiência geográfica.

### Features
- 🔗 Encurtamento de URLs com slugs customizáveis
- 📊 Analytics em tempo real (hits, engajamentos, cliques)
- 🌍 Rastreamento geográfico (país, cidade) com mapa de engajamentos
- 📱 Detecção automática de dispositivo (mobile/desktop) e SO
- 🎯 Geração de QR codes com opções de customização
- 🔐 Autenticação com JWT (email/senha + OAuth via Supabase)
- ⚡ Cache inteligente com Redis
- 🛡️ Rate limiting e proteção contra abuso
- 📈 Paginação otimizada para grandes volumes de dados
- 🐳 Deploy containerizado com Docker

### Stack Técnico
- **Runtime**: Node.js >= 24
- **Framework**: Fastify (HTTP rápido e tipo-seguro)
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT + Supabase
- **Geolocalização**: geoip-lite
- **TypeScript**: 100% type-safe

## Requisitos

- Node.js >= 24
- pnpm
- Docker

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.exemple .env
```

## 📚 Documentação de Arquitetura

**Para IA entender a estrutura automaticamente, consulte:**
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Documentação completa (Clean Architecture + DDD)
- [`.copilot-instructions.md`](./.copilot-instructions.md) - Instruções para GitHub Copilot
- [`CLAUDE.md`](./.claude.md) - Instruções para Claude/Claude Code

## Desenvolvimento

Ambiente local: só os bancos (Postgres + Redis) rodam em Docker, a API roda direto na sua máquina com hot-reload.

1. **Instale as dependências**

   ```bash
   pnpm install
   ```

2. **Configure o `.env`** (veja [Variáveis de ambiente](#variáveis-de-ambiente)). Para bater com o `docker-compose.dev.yml`, use:

   ```bash
   DATABASE_URL="postgresql://mvUser:mbPass@localhost:5432/mvDb"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   NODE_ENV=development
   ```

3. **Suba Postgres e Redis via Docker** (`docker-compose.dev.yml` só sobe os bancos, não a API):

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

   | Serviço  | Container         | Porta local | Credenciais                          |
   |----------|--------------------|-------------|---------------------------------------|
   | Postgres | `mv_postgres_dev`  | `5432`      | user `mvUser` / senha `mbPass` / db `mvDb` |
   | Redis    | `mv_redis_dev`     | `6379`      | sem senha                              |

   Para derrubar os bancos: `docker-compose -f docker-compose.dev.yml down` (adicione `-v` para apagar os volumes/dados).

4. **Gere o client do Prisma e rode as migrations**

   ```bash
   pnpm generate
   pnpm deploy   # roda as migrations
   pnpm seed     # popula dados iniciais (planos, etc.) — obrigatório antes do primeiro uso
   ```

5. **Suba a API em modo dev (watch)**

   ```bash
   pnpm dev
   ```

A API sobe em `http://localhost:<PORT>` e a documentação interativa fica em `http://localhost:<PORT>/docs` (veja [Documentação da API (Swagger)](#documentação-da-api-swagger)).

## Documentação da API (Swagger)

Com o servidor rodando, a documentação interativa (OpenAPI) fica disponível em:

```
http://localhost:<PORT>/docs
```

- Gerada automaticamente a partir dos schemas Zod de cada rota (`fastify-type-provider-zod` + `@fastify/swagger` + `@fastify/swagger-ui`) — não há DTOs duplicados só para a doc.
- Rotas organizadas por tag de domínio: `Auth`, `Links`, `Redirect`, `Analytics`, `User`, `Health`.
- Rotas protegidas exigem JWT: clique em **Authorize** no topo da página e informe `Bearer <token>`.
- A UI abre direto na aba de schema (tipos, obrigatoriedade, enums) em vez do exemplo cru; configurável em [`src/infra/http/plugins/swagger.ts`](./src/infra/http/plugins/swagger.ts).

## Build

```bash
pnpm build
```

## Produção

Sobe toda a stack (API + Postgres + Redis) via Docker:

```bash
docker-compose up -d
```

Rebuildar após mudanças no código:

```bash
docker-compose up -d --build api
```

Ver logs da API:

```bash
docker-compose logs -f api
```

## Banco de dados

```bash
# Rodar migrations
pnpm deploy

# Rodar seed
pnpm seed
```

## Testes

Os testes unitários rodam automaticamente a cada commit via husky.

```bash
pnpm test:unit
```

### Pular testes temporariamente

Crie o arquivo `.skip-tests-until` na raiz com a data de expiração no formato `YYYY-MM-DD`:

```bash
echo "2026-04-10" > .skip-tests-until
```

O hook ignorará os testes até essa data (inclusive) e removerá o arquivo automaticamente ao expirar. Para reativar antes do prazo:

```bash
rm .skip-tests-until
```

> O arquivo está no `.gitignore` e não será commitado.

## Referências

- [tsconfig bases por versão do Node.js](https://github.com/tsconfig/bases?tab=readme-ov-file)


## Testes

Os testes unitários rodam automaticamente a cada commit via husky.

```bash
pnpm test:unit
```

### Pular testes temporariamente

Crie o arquivo `.skip-tests-until` na raiz com a data de expiração no formato `YYYY-MM-DD`:

```bash
echo "2026-04-10" > .skip-tests-until
```

O hook ignorará os testes até essa data (inclusive) e removerá o arquivo automaticamente ao expirar. Para reativar antes do prazo:

```bash
rm .skip-tests-until
```

> O arquivo está no `.gitignore` e não será commitado.