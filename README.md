# mv-api

## Requisitos

- Node.js >= 24
- pnpm
- Docker

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

## Desenvolvimento

Sobe apenas os bancos (Postgres + Redis) via Docker e roda o servidor localmente:

```bash
docker-compose -f docker-compose.dev.yml up -d
pnpm install
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

```bash
pnpm test:unit
```

## Referências

- [tsconfig bases por versão do Node.js](https://github.com/tsconfig/bases?tab=readme-ov-file)
