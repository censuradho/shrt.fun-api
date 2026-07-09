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
cp .env.example .env
```

## 📚 Documentação de Arquitetura

**Para IA entender a estrutura automaticamente, consulte:**
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Documentação completa (Clean Architecture + DDD)
- [`.copilot-instructions.md`](./.copilot-instructions.md) - Instruções para GitHub Copilot
- [`CLAUDE.md`](./.claude.md) - Instruções para Claude/Claude Code

## Desenvolvimento

Sobe apenas os bancos (Postgres + Redis) via Docker e roda o servidor localmente:

```bash
docker-compose -f docker-compose.dev.yml up -d
pnpm install
pnpm deploy   # roda as migrations
pnpm seed     # popula dados iniciais (planos, etc.) — obrigatório antes do primeiro uso
pnpm dev
```

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