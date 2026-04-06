# Documentação de Arquitetura - MV API

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Técnico](#stack-técnico)
3. [Princípios Arquiteturais](#princípios-arquiteturais)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Padrões de Implementação](#padrões-de-implementação)
6. [Módulos](#módulos)
7. [Layers (Camadas)](#layers-camadas)
8. [Integração com Fastify](#integração-com-fastify)
9. [Banco de Dados](#banco-de-dados)
10. [Cache e Performance](#cache-e-performance)
11. [Autenticação e Autorização](#autenticação-e-autorização)
12. [Error Handling](#error-handling)
13. [Testes](#testes)
14. [Deployment e Docker](#deployment-e-docker)
15. [Guia Implementação em Novo Projeto](#guia-implementação-em-novo-projeto)

---

## Visão Geral

Esta é uma API de encurtador de URLs com analytics em tempo real e geolocalização, construída com **Clean Architecture** combinada com **Domain-Driven Design (DDD)**. O projeto utiliza TypeScript, Fastify, PostgreSQL com Prisma ORM, Redis para cache e Supabase para autenticação.

### Características Principais

- ✅ **Type-Safe**: 100% TypeScript com validação de tipos
- ✅ **Modular**: Estrutura modular clara com separação de responsabilidades
- ✅ **Escalável**: Preparada para crescimento com patterns reconhecidos na indústria
- ✅ **Testável**: Testes unitários com Vitest
- ✅ **Performance**: Uso estratégico de cache com Redis
- ✅ **Container-Ready**: Docker e Docker Compose para facilititar deploy

---

## Stack Técnico

### Core
- **Node.js >= 24**: Runtime JavaScript moderno
- **TypeScript**: Linguagem com tipagem estática
- **Fastify v5**: Framework HTTP ultra-rápido e type-safe
- **pnpm**: Gerenciador de pacotes eficiente

### Banco de Dados
- **PostgreSQL**: Banco de dados relacional
- **Prisma ORM**: Type-safe database access
- **Prisma Migrations**: Controle de versão do schema

### Cache e Comunicação
- **Redis (ioredis)**: Cache distribuído
- **Zod**: Validação de dados em runtime com schemas

### Autenticação
- **JWT**: Tokens com @fastify/jwt
- **Supabase**: Serviço de autenticação

### Utilidades
- **Pino**: Logger estruturado
- **geoip-lite**: Geolocalização IP
- **ua-parser-js**: Parsing de User Agent
- **qrcode**: Geração de QR Codes
- **date-fns**: Manipulação de datas
- **nanoid**: Geração de IDs únicos

### Tooling e Qualidade
- **ESLint**: Linting de código
- **Vitest**: Framework de testes unitários
- **Husky + CommitLint**: Git hooks e padronização de commits
- **tsup**: Builder otimizado para TypeScript

---

## Princípios Arquiteturais

### 1. Clean Architecture

A arquitetura segue os princípios de Clean Architecture com clara separação entre camadas:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│     (Controllers, Routes, DTOs)          │
├─────────────────────────────────────────┤
│       Application Layer                  │
│    (Use Cases, Queries, DTOs)           │
├─────────────────────────────────────────┤
│         Domain Layer                     │
│   (Models, Interfaces, Business Logic)  │
├─────────────────────────────────────────┤
│      Infrastructure Layer                │
│ (Repositories, Services, Gateways)     │
└─────────────────────────────────────────┘
```

### 2. Domain-Driven Design (DDD)

O projeto funciona com **bounded contexts** (módulos independentes), cada um responsável por seu domínio:

- **User Module**: Gerenciamento de usuários
- **Auth Module**: Autenticação e autorização
- **Link Module**: Criação e gerenciamento de URLs curtas
- **Analytics Module**: Tracking e análise de dados
- **AI Module**: Funcionalidades relacionadas a IA (escalabilidade)

### 3. SOLID Principles

- **S**ingle Responsibility: Cada classe tem apenas uma responsabilidade
- **O**pen/Closed: Classes abertas para extensão, fechadas para modificação
- **L**iskov Substitution: Subclasses podem substituir suas superclasses
- **I**nterface Segregation: Interfaces específicas e não genéricas
- **D**ependency Inversion: Depender de abstrações, não de implementações concretas

### 4. Dependency Injection

Todos os módulos usam constructor injection para inverter o controle. As dependências são injetadas via **factories** na camada de apresentação.

---

## Estrutura de Pastas

```
mv-api/
├── src/
│   ├── @types/                    # Tipos globais e extensões
│   ├── assets/                    # Assets estáticos (imgs, logos)
│   ├── docs/                      # Documentação interna
│   ├── domain/                    # Interfaces de domínio global
│   │   ├── CacheGateway.ts
│   │   ├── EnvProvider.ts
│   │   ├── IDeviceService.ts
│   │   └── IGeolocationService.ts
│   ├── generated/                 # Código gerado (Prisma Client)
│   ├── infra/                     # Camada de infraestrutura
│   │   ├── cache/
│   │   │   └── RedisCacheGateway.ts
│   │   ├── config/
│   │   │   ├── cors.ts
│   │   │   ├── ProcessEnvProvider.ts
│   │   │   └── rateLimit.ts
│   │   ├── database/
│   │   │   └── prisma.ts          # Singleton do Prisma Client
│   │   ├── device/
│   │   │   └── UaParserDeviceService.ts
│   │   ├── geolocation/
│   │   │   └── GeoipLiteGeolocationService.ts
│   │   └── http/
│   │       └── plugins/
│   │           └── redis.ts       # Plugin Fastify para Redis
│   ├── main/                      # Entrada da aplicação
│   │   ├── app.ts                 # Configuração da instância Fastify
│   │   ├── error-handler.ts       # Handler global de erros
│   │   └── server.ts              # Inicialização do servidor
│   ├── modules/                   # Módulos de negócio (Bounded Contexts)
│   │   ├── auth/
│   │   │   ├── index.ts           # Plugin export
│   │   │   ├── plugin.ts          # Plugin Fastify
│   │   │   ├── application/       # Use cases e DTOs
│   │   │   ├── domain/            # Models, interfaces, erros
│   │   │   ├── infra/             # Repositories, services
│   │   │   └── presentation/      # Controllers, routes, factories
│   │   ├── link/                  # Mesmo padrão que auth
│   │   ├── user/
│   │   ├── analytics/
│   │   └── ai/
│   ├── shared/                    # Código compartilhado
│   │   ├── constants/
│   │   │   └── httpStatusCodes.ts
│   │   ├── errors/
│   │   │   ├── AppError.ts        # Classe base de erros
│   │   │   ├── ErrorLog.ts
│   │   │   └── errors.ts
│   │   ├── helpers/               # Funções utilitárias
│   │   │   ├── base64MaxSize.ts
│   │   │   ├── generateHash.ts
│   │   │   ├── sanitizeString.ts
│   │   │   ├── slugify.ts
│   │   │   └── validations.ts
│   │   ├── kernel/                # Utilidades avançadas
│   │   ├── types/                 # Tipos compartilhados
│   │   └── utils/                 # Utilitários gerais
│   └── tests/                     # Testes unitários
│       ├── application/
│       ├── infra/
│       ├── shered/
│       └── utils/
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados
│   ├── seed.ts                    # Script de seed
│   └── migrations/                # Histórico de migrações
├── public/                        # Arquivos estáticos
├── _scripts/                      # Scripts utilitários
│   └── generate-qrcodes.ts
├── docker-compose.yml             # Produção
├── docker-compose.dev.yml         # Desenvolvimento
├── docker-compose.db.yml          # Apenas bancos
├── Dockerfile
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── tsup.config.ts
├── eslint.config.mjs
└── commitlint.config.js
```

---

## Padrões de Implementação

### 1. Módulos (Bounded Contexts)

Cada módulo é auto-contido e segue a estrutura:

```
modules/
└── user/
    ├── index.ts                   # Exporta a função plugin
    ├── plugin.ts                  # Registra plugin no Fastify
    ├── application/
    │   ├── dtos/
    │   │   └── update-username.dto.ts
    │   ├── use-cases/
    │   │   ├── UpdateUsername.useCase.ts
    │   │   └── GetUserProfile.useCase.ts
    │   └── queries/               # Operações de leitura
    ├── domain/
    │   ├── errors/
    │   │   └── user.errors.ts
    │   ├── interfaces/
    │   ├── models/
    │   │   └── User.model.ts      # Entidade de domínio
    │   ├── repositories/
    │   │   └── IUserRepository.ts # Interface (não implementação!)
    │   └── services/
    ├── infra/
    │   ├── repositories/
    │   │   └── user.repository.ts # Implementação concreta
    │   ├── http-adapters/
    │   └── services/
    └── presentation/
        ├── controllers/
        │   └── user.controller.ts
        ├── factories/
        │   └── makeUserController.ts
        └── routes.ts              # Definição de rotas
```

### 2. Fluxo de Requisição

```
request
  ↓
[routes.ts] - Define caminho e validação com Zod
  ↓
[controller] - Parse input, chama use case
  ↓
[use case] - Lógica de aplicação, orquestra domain
  ↓
[domain/services] - Lógica de negócio pura
  ↓
[repository] - Acesso a dados via Prisma
  ↓
[database] - Retorna dados
  ↓
[response] - JSON serializado
```

### 3. DTOs (Data Transfer Objects)

DTOs definem o contrato entre camadas:

```typescript
// application/dtos/update-username.dto.ts
import { z } from 'zod';

export const UpdateUsernameDto = z.object({
  username: z.string().min(3).max(50),
});

export type UpdateUsernameDto = z.infer<typeof UpdateUsernameDto>;
```

### 4. Use Cases

Encapsulam a lógica de aplicação:

```typescript
// application/use-cases/UpdateUsername.useCase.ts
export class UpdateUsernameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(supabaseId: string, username: string): Promise<void> {
    // Validação de negócio
    const taken = await this.userRepository.checkIfUsernameExists(username);
    if (taken) {
      throw new AppError(USER_ERRORS_MESSAGES.USERNAME_ALREADY_TAKEN, {
        status: HTTP_STATUS_CODES.CONFLICT,
      });
    }

    // Executa ação
    await this.userRepository.updateUsername(supabaseId, username);
  }
}
```

### 5. Repositories (Data Access)

Abstraem acesso a dados:

```typescript
// domain/repositories/IUserRepository.ts (Interface)
export interface IUserRepository {
  create(input: CreateUserEntityDto): Promise<string>;
  checkIfUsernameExists(username: string): Promise<boolean>;
  findUserBySupabaseId(supabaseId: string): Promise<UserModel | null>;
  updateUsername(supabaseId: string, username: string): Promise<void>;
}

// infra/repositories/user.repository.ts (Implementação)
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserBySupabaseId(supabaseId: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async updateUsername(supabaseId: string, username: string): Promise<void> {
    await this.prisma.user.update({
      where: { supabaseId },
      data: { username },
    });
  }
}
```

### 6. Controllers

Adaptam requisições HTTP para use cases:

```typescript
// presentation/controllers/user.controller.ts
export class UserController {
  constructor(
    private readonly updateUsernameUseCase: UpdateUsernameUseCase,
  ) {}

  async updateUsername(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.body as UpdateUsernameDto;
    await this.updateUsernameUseCase.execute(request.user.id, username);
    return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }
}
```

### 7. Factories (Dependency Injection)

Criam instâncias com todas as dependências:

```typescript
// presentation/factories/makeUserController.ts
export function makeUserController(): UserController {
  const userRepository = new UserRepository(prisma);
  const updateUsernameUseCase = new UpdateUsernameUseCase(userRepository);
  return new UserController(updateUsernameUseCase);
}
```

### 8. Routes

Definem rutas HTTP com validação:

```typescript
// presentation/routes.ts
import { FastifyInstance } from 'fastify';
import { makeUserController } from './factories/makeUserController';
import { UpdateUsernameDto } from '../application/dtos/update-username.dto';

export async function registerUserRoutes(app: FastifyInstance) {
  const controller = makeUserController();

  app.patch<{ Body: UpdateUsernameDto }>(
    '/username',
    {
      schema: {
        body: UpdateUsernameDto,
      },
      onRequest: [app.authenticate], // Middleware de autenticação
    },
    (request, reply) => controller.updateUsername(request, reply),
  );
}
```

---

## Layers (Camadas)

### Domain Layer

**Responsabilidade**: Lógica de negócio pura, independente de Framework

**Conteúdo**:
- Models/Entities
- Interfaces de Repository
- Value Objects
- Lógica de validação de negócio
- Erros de domínio

**Características**:
- Sem dependências externas
- Testável sem mocks complexos
- Linguagem de negócio

```typescript
// domain/models/User.model.ts
export interface UserModel {
  id: string;
  supabaseId: string;
  email: string;
  username?: string;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  create(input: CreateUserEntityDto): Promise<string>;
  findUserBySupabaseId(supabaseId: string): Promise<UserModel | null>;
}
```

### Application Layer

**Responsabilidade**: Orquestração de casos de uso

**Conteúdo**:
- Use Cases / Command Handlers
- Query Handlers
- DTOs
- Application Services

**Características**:
- Depende apenas de Domain
- Orquestra Repositories e Services
- Implementa regras de negócio não puras

```typescript
// application/use-cases/UpdateUsername.useCase.ts
export class UpdateUsernameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(supabaseId: string, username: string): Promise<void> {
    const taken = await this.userRepository.checkIfUsernameExists(username);
    if (taken) throw new AppError(...);
    await this.userRepository.updateUsername(supabaseId, username);
  }
}
```

### Infrastructure Layer

**Responsabilidade**: Implementações concretas de interfaces

**Conteúdo**:
- Implementations de Repositories
- Services de integração (APIs externas)
- Gateways (Cache, Email, etc.)
- Configurações

**Características**:
- Implementa interfaces do Domain
- Acessa banco de dados, serviços externos
- Framework-specific code

```typescript
// infra/repositories/user.repository.ts
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserBySupabaseId(supabaseId: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { supabaseId } });
  }
}

// infra/cache/RedisCacheGateway.ts
export class RedisCacheGateway implements CacheGateway {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
}
```

### Presentation Layer

**Responsabilidade**: Interface com o mundo externo (HTTP)

**Conteúdo**:
- Controllers
- Routes
- Factories
- HTTP Middleware
- Schemas de validação

**Características**:
- Converte input HTTP para objetos de aplicação
- Chama Use Cases
- Converte respostas para JSON
- Gerencia autenticação/autorização

```typescript
// presentation/controllers/user.controller.ts
export class UserController {
  constructor(private readonly updateUsernameUseCase: UpdateUsernameUseCase) {}

  async updateUsername(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.body as UpdateUsernameDto;
    await this.updateUsernameUseCase.execute(request.user.id, username);
    return reply.status(204).send();
  }
}

// presentation/routes.ts
export async function registerUserRoutes(app: FastifyInstance) {
  const controller = makeUserController();

  app.patch(
    '/username',
    { schema: { body: UpdateUsernameDto }, onRequest: [app.authenticate] },
    (req, reply) => controller.updateUsername(req, reply),
  );
}
```

---

## Integração com Fastify

### Plugin Architecture

O Fastify é extensível via plugins. Cada módulo se registra como um plugin:

```typescript
// plugins registram no app via app.register()
app.register(userModule, { prefix: '/users' });
app.register(authModule, { prefix: '/auth' });
app.register(linkModule, { prefix: '/links' });
```

### Type-Safe Routing com Zod

Usa `fastify-type-provider-zod` para validação tipo-segura:

```typescript
app.patch<{ Body: UpdateUsernameDto }>(
  '/username',
  {
    schema: {
      body: UpdateUsernameDto, // Schemas são validados e tipados automaticamente
    },
  },
  handler,
);
```

### Middleware (Hooks)

Fastify oferece hooks para executar lógica transversal:

```typescript
// Autenticação
app.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });

app.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
});

// Rate Limiting
app.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '15 minutes',
});

// CORS
app.register(require('@fastify/cors'), corsConfig);
```

### Plugins Customizados

Plugins permitem encapsular funcionalidades:

```typescript
// infra/http/plugins/redis.ts
import fastifyPlugin from 'fastify-plugin';
import Redis from 'ioredis';

export const redisPlugin = fastifyPlugin(async (app) => {
  const redis = new Redis(process.env.REDIS_URL);
  app.decorate('redis', redis);
  
  app.addHook('onClose', async () => {
    await redis.quit();
  });
});

// Uso
app.register(redisPlugin);
app.get('/data', async (request, reply) => {
  const cached = await request.server.redis.get('key');
  return cached ? JSON.parse(cached) : null;
});
```

### Global Error Handler

```typescript
// main/error-handler.ts
export const errorHandler = (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // AppError: Erros esperados de negócio
  if (error instanceof AppError) {
    return reply.status(error.status).send({ message: error.message });
  }

  // Rate Limit
  if (error.statusCode === 429) {
    return reply.status(429).send({ message: 'RATE_LIMIT_EXCEEDED' });
  }

  // Validação (Zod)
  if (error.validation) {
    return reply.status(400).send({
      errors: error.validation.map((err: any) => ({
        field: err.instancePath?.replace(/^\//, '') || '',
        message: err.message,
      })),
    });
  }

  // Erro genérico
  reply.status(500).send({ message: 'INTERNAL_SERVER_ERROR' });
};

// Registrar no app
app.setErrorHandler(errorHandler);
```

---

## Banco de Dados

### Prisma Schema

O `schema.prisma` define toda a estrutura de dados:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id String @id @default(nanoid())
  supabaseId String @unique
  email String @unique
  username String? @unique
  plan Plan @default(STARTER)
  
  urls Url[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Url {
  id String @id @default(nanoid())
  
  originalUrl String
  shortUrl String @unique
  title String?
  
  hits Hit[]
  hitsCount Int @default(0)
  
  userId String?
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  isActive Boolean @default(true)
  isAnonymous Boolean @default(false)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@map("urls")
}

model Hit {
  id String @id @default(nanoid())
  
  urlId String
  url Url @relation(fields: [urlId], references: [id], onDelete: Cascade)
  
  ipAddress String
  userAgent String
  country String?
  city String?
  
  createdAt DateTime @default(now())
  
  @@index([urlId])
  @@index([country])
  @@map("hits")
}
```

### Migrations

Controle de versão de schema:

```bash
# Criar migration após alterar schema.prisma
pnpm prisma migrate dev --name nome_da_alteracao

# Aplicar migrations em produção
pnpm prisma migrate deploy

# Resetar banco (apenas dev!)
pnpm prisma migrate reset
```

### Prisma Client

Singleton centralizado:

```typescript
// infra/database/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Uso nos repositories
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserBySupabaseId(supabaseId: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { supabaseId } });
  }
}
```

---

## Cache e Performance

### Redis Gateway

Abstração para cache:

```typescript
// domain/CacheGateway.ts (Interface)
export interface CacheGateway {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// infra/cache/RedisCacheGateway.ts (Implementação)
export class RedisCacheGateway implements CacheGateway {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

### Cache Key Builder

Helper para gerar chaves consistentes:

```typescript
// shared/kernel/CacheKeyBuilder.ts
export class CacheKeyBuilder {
  static userProfile(userId: string): string {
    return `user:profile:${userId}`;
  }

  static linkAnalytics(linkId: string): string {
    return `link:analytics:${linkId}`;
  }

  static statisticsByCountry(linkId: string): string {
    return `link:stats:country:${linkId}`;
  }
}

// Uso
const cacheKey = CacheKeyBuilder.userProfile(userId);
const cached = await cacheGateway.get<UserModel>(cacheKey);
if (!cached) {
  const user = await repository.findUserBySupabaseId(userId);
  await cacheGateway.set(cacheKey, user, 3600);
}
```

### Estratégias de Cache

1. **Cache-Aside (Lazy Loading)**: Busca do cache, se não existir, busca do DB e cacheia
2. **Write-Through**: Escreve no cache e no DB simultaneamente
3. **TTL (Time-To-Live)**: Expiração automática de chaves

```typescript
// Exemplo: Cache-Aside
async getUser(userId: string): Promise<UserModel> {
  // Tenta cache
  const cached = await this.cacheGateway.get<UserModel>(
    CacheKeyBuilder.userProfile(userId),
  );
  if (cached) return cached;

  // Cache miss: busca DB
  const user = await this.userRepository.findById(userId);
  if (user) {
    // Armazena em cache com 1 hora de TTL
    await this.cacheGateway.set(
      CacheKeyBuilder.userProfile(userId),
      user,
      3600,
    );
  }
  return user;
}
```

---

## Autenticação e Autorização

### JWT com Fastify

```typescript
// Via decorator no Fastify
app.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: '24h',
  },
});

// Middleware de autenticação
app.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
});

// Uso em rotas
app.patch(
  '/username',
  { onRequest: [app.authenticate] }, // Protege a rota
  handler,
);
```

### Supabase Integration

```typescript
// infra/auth/supabase.service.ts
import { createClient } from '@supabase/supabase-js';

export class SupabaseAuthService {
  private readonly client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );

  async verifyToken(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error) throw new AppError('Invalid token', { status: 401 });
    return data.user;
  }
}
```

### Role-Based Access Control (RBAC)

```typescript
// Exemplo: Apenas usuários com plano PREMIUM podem usar certas features
async execute(userId: string, ...args): Promise<void> {
  const user = await this.userRepository.findById(userId);
  
  if (user.plan !== Plan.PREMIUM) {
    throw new AppError('Feature only available for PREMIUM users', {
      status: 403,
    });
  }

  // Continua execução
}
```

---

## Error Handling

### AppError (Custom Error)

```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  public readonly code?: string;
  public readonly status: number;

  constructor(
    message: string,
    options: { code?: string; status: number } = {
      code: message,
      status: 400,
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options?.code;
    this.status = options.status;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Centralização de Mensagens de Erro

```typescript
// modules/user/domain/errors/user.errors.ts
export const USER_ERRORS_MESSAGES = {
  NOT_FOUND: 'User not found',
  USERNAME_ALREADY_TAKEN: 'Username already taken',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_EMAIL: 'Invalid email format',
};

// Uso
if (taken) {
  throw new AppError(USER_ERRORS_MESSAGES.USERNAME_ALREADY_TAKEN, {
    status: HTTP_STATUS_CODES.CONFLICT,
  });
}
```

### Tratamento Global

```typescript
// main/error-handler.ts
export const errorHandler = (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Log estruturado
  request.log.error(error);

  // AppError: Esperados
  if (error instanceof AppError) {
    return reply.status(error.status).send({ message: error.message });
  }

  // Validação Zod
  if (error.validation) {
    return reply.status(400).send({
      errors: error.validation.map((err: any) => ({
        field: err.instancePath?.replace(/^\//, '') || '',
        message: err.message,
      })),
    });
  }

  // Rate Limit
  if (error.statusCode === 429) {
    return reply.status(429).send({ message: 'RATE_LIMIT_EXCEEDED' });
  }

  // Erro genérico
  reply.status(500).send({ message: 'INTERNAL_SERVER_ERROR' });
};
```

---

## Testes

### Configuração do Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
```

### Unit Tests

```typescript
// src/tests/application/use-cases/UpdateUsername.useCase.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { UpdateUsernameUseCase } from '@/modules/user/application/use-cases/UpdateUsername.useCase';
import { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository';
import { AppError } from '@/shared/errors/AppError';

describe('UpdateUsernameUseCase', () => {
  it('should update username when it is not taken', async () => {
    // Arrange
    const mockRepository: IUserRepository = {
      checkIfUsernameExists: vi.fn().mockResolvedValue(false),
      updateUsername: vi.fn().mockResolvedValue(undefined),
    } as any;

    const useCase = new UpdateUsernameUseCase(mockRepository);

    // Act
    await useCase.execute('user-123', 'newusername');

    // Assert
    expect(mockRepository.updateUsername).toHaveBeenCalledWith(
      'user-123',
      'newusername',
    );
  });

  it('should throw error when username is already taken', async () => {
    // Arrange
    const mockRepository: IUserRepository = {
      checkIfUsernameExists: vi.fn().mockResolvedValue(true),
    } as any;

    const useCase = new UpdateUsernameUseCase(mockRepository);

    // Act & Assert
    await expect(useCase.execute('user-123', 'taken')).rejects.toThrow(
      AppError,
    );
  });
});
```

### Testes de Repositório

```typescript
// src/tests/infra/repositories/user/UserRepository.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/modules/user/infra/repositories/user.repository';

describe('UserRepository', () => {
  let prisma: PrismaClient;
  let repository: UserRepository;

  beforeAll(() => {
    prisma = new PrismaClient();
    repository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should find user by supabase id', async () => {
    // Arrange
    const supabaseId = 'test-user-id';
    // Seed dados...

    // Act
    const user = await repository.findUserBySupabaseId(supabaseId);

    // Assert
    expect(user).toBeDefined();
    expect(user?.supabaseId).toBe(supabaseId);
  });
});
```

### Executar Testes

```bash
# Rodar testes
pnpm test:unit

# UI interativa
pnpm test:unit:ui

# Coverage
pnpm test:unit -- --coverage
```

---

## Deployment e Docker

### Dockerfile Multi-Stage

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Runtime
FROM node:24-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN chown -R appuser:appgroup /app

USER appuser

CMD ["sh", "-c", "node dist/server.js"]
```

**Vantagens**:
- Apenas dependências de produção na imagem final
- Tamanho reduzido (~200MB vs ~1GB)
- Build otimizado em paralelo
- Segurança: executa com usuário não-root

### docker-compose.yml (Produção)

```yaml
services:
  api:
    build: .
    container_name: mv_api
    restart: always
    ports:
      - "${PORT:-3000}:3333"
    environment:
      HUSKY: 0
    env_file:
      - .env.prod
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    container_name: mv_postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: mv_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### docker-compose.dev.yml (Desenvolvimento)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: mv_postgres_dev
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: mv_dev
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: mv_redis_dev
    ports:
      - "6379:6379"

volumes:
  postgres_dev_data:
```

**Uso**:
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d
pnpm install
pnpm deploy    # migrations
pnpm seed      # seed data
pnpm dev       # roda localmente

# Produção
docker-compose up -d --build
```

---

## Guia Implementação em Novo Projeto

### Passo 1: Setup Inicial

```bash
# Criar projeto
mkdir meu-projeto && cd meu-projeto
pnpm init

# TypeScript
pnpm add -D typescript tsx tsconfig-paths tsup

# Inicializar tsconfig
npx tsc --init
```

### Passo 2: Dependências Core

```bash
# Fastify e plugins
pnpm add fastify @fastify/jwt @fastify/cors @fastify/rate-limit @fastify/cookie fastify-plugin fastify-type-provider-zod

# Banco de dados
pnpm add @prisma/client pg
pnpm add -D prisma @prisma/adapter-pg

# Validação e tipos
pnpm add zod

# Cache
pnpm add ioredis

# Logging
pnpm add pino pino-pretty

# Utilitários
pnpm add dotenv date-fns nanoid

# Dev
pnpm add -D @types/node vitest eslint @eslint/js husky @commitlint/cli @commitlint/config-conventional
```

### Passo 3: Estrutura Base

```
src/
├── @types/
│   ├── fastify.d.ts
│   └── svg.d.ts
├── domain/
│   ├── CacheGateway.ts
│   └── EnvProvider.ts
├── infra/
│   ├── cache/
│   │   └── RedisCacheGateway.ts
│   ├── config/
│   │   └── ProcessEnvProvider.ts
│   ├── database/
│   │   └── prisma.ts
│   └── http/
│       └── plugins/
│           └── redis.ts
├── main/
│   ├── app.ts
│   ├── error-handler.ts
│   └── server.ts
├── modules/
│   └── user/                    # Exemplo de módulo
│       ├── index.ts
│       ├── plugin.ts
│       ├── application/
│       │   ├── dtos/
│       │   └── use-cases/
│       ├── domain/
│       │   ├── errors/
│       │   ├── models/
│       │   ├── repositories/
│       │   └── services/
│       ├── infra/
│       │   └── repositories/
│       └── presentation/
│           ├── controllers/
│           ├── factories/
│           └── routes.ts
├── shared/
│   ├── constants/
│   ├── errors/
│   ├── helpers/
│   ├── kernel/
│   ├── types/
│   └── utils/
└── tests/

prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

### Passo 4: Configuração TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "lib": ["ES2024"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
```

### Passo 5: Inicializar Prisma

```bash
pnpm prisma init

# Editar .env com database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Criar schema básico
pnpm prisma db push
```

### Passo 6: Implementar Main App

```typescript
// src/main/app.ts
import 'dotenv/config';
import Fastify from 'fastify';
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { errorHandler } from './error-handler';

export const app = Fastify({
  trustProxy: true,
  logger: process.env.NODE_ENV !== 'production'
    ? { transport: { target: 'pino-pretty' } }
    : true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

// Registrar módulos
// app.register(userModule, { prefix: '/users' });

export default app;
```

### Passo 7: Implementar Primeiro Módulo

Seguir o padrão estabelecido neste documento:

1. Criar `domain/models/` - Entidades
2. Criar `domain/repositories/` - Interfaces
3. Criar `domain/errors/` - Mensagens de erro
4. Criar `application/dtos/` - Schemas de validação
5. Criar `application/use-cases/` - Lógica
6. Criar `infra/repositories/` - Implementações
7. Criar `presentation/controllers/` - Handlers HTTP
8. Criar `presentation/routes.ts` - Rotas
9. Criar `presentation/factories/` - Dependency Injection
10. Criar `plugin.ts` - Registra plugin

### Passo 8: Build e Deploy

```bash
# Build
pnpm build

# Rodar
node dist/server.js

# Docker
docker build -t meu-projeto .
docker run -p 3000:3333 meu-projeto
```

---

## Convenções e Best Practices

### 1. Naming

- **Classes**: PascalCase (`UserRepository`, `UpdateUsernameUseCase`)
- **Interfaces**: Prefixo `I` + PascalCase (`IUserRepository`, `ICacheGateway`)
- **Functions**: camelCase (`getUser`, `updateUsername`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_REQUEST_SIZE`, `JWT_SECRET`)
- **Files**: kebab-case (`user-repository.ts`, `update-username.use-case.ts`)

### 2. Organização

- Uma classe por arquivo
- Interfaces no mesmo diretório que a implementação
- DTOs próximos ao uso (em `application/`)
- Testes ao lado do código (`*.spec.ts`)

### 3. Imports

```typescript
// 1. Imports do Node
import { createClient } from 'ioredis';

// 2. Imports de dependências
import { z } from 'zod';

// 3. Imports internos
import { AppError } from '@/shared/errors/AppError';

// 4. Imports relativos (se necessário)
import { IUserRepository } from '../repositories/IUserRepository';
```

### 4. Validation

```typescript
// Sempre validar input com Zod
const schema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
});

const input = schema.parse(data); // Lança erro se inválido
```

### 5. Error Handling

```typescript
// Sempre usar AppError para erros esperados
if (!user) {
  throw new AppError('User not found', {
    status: 404,
    code: 'USER_NOT_FOUND',
  });
}

// Deixar FastifyError ou erro genérico cair no handler global
```

### 6. Testing

- Teste sempre: Controllers, Use Cases, Repositories, Services
- Mock apenas o necessário
- Use factories para simplificar setup
- Nomeie testes com "should + ação + esperado"

### 7. Git Commits

```bash
# Usar Conventional Commits
# feat: Adiciona nova feature
# fix: Corrige bug
# refactor: Melhora código sem alterar funcionalidade
# test: Adiciona/altera testes
# docs: Alterações em documentação
# chore: Alterações em build, deps, etc

git commit -m "feat: adiciona suporte a autenticação OAuth"
```

---

## Checklist Implementação em Novo Projeto

- [ ] Setup inicial com Node.js, pnpm, TypeScript
- [ ] Instalar todas as dependências
- [ ] Configurar TypeScript com caminhos de alias
- [ ] Inicializar Prisma com bank
- [ ] Criar estrutura de pastas
- [ ] Implementar app.ts com configuração Fastify
- [ ] Implementar error-handler.ts
- [ ] Implementar CacheGateway e Redis
- [ ] Criar primeiro módulo (user/auth)
  - [ ] Domain layer (models, repositories, errors)
  - [ ] Application layer (use-cases, dtos)
  - [ ] Infrastructure layer (repositories)
  - [ ] Presentation layer (controllers, routes, factories)
- [ ] Configurar autenticação (JWT/Supabase)
- [ ] Configurar validação com Zod
- [ ] Implementar testes com Vitest
- [ ] Configurar Docker e docker-compose
- [ ] Documentar variáveis de ambiente
- [ ] Setup CI/CD (opcional)
- [ ] Deploy em produção

---

## Recursos Adicionais

### Documentação Oficial
- [Fastify Docs](https://www.fastify.io)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Zod Docs](https://zod.dev)
- [Vitest Docs](https://vitest.dev)

### Livros e Artigos
- "Clean Code" - Robert C. Martin
- "Domain-Driven Design" - Eric Evans
- "Refactoring" - Martin Fowler

### Comunidades
- Node.js Discord
- TypeScript Community
- Fastify Discord

---

## FAQ

**P: Por que usar Interfaces em vez de classes abstratas?**
R: Interfaces definem contratos sem implementação, facilitando inversão de dependência e testes com mocks.

**P: Como escalar para múltiplas instâncias?**
R: Use Redis para cache distribuído, balanceador de carga (nginx), e banco de dados replicado.

**P: Como estruturar um módulo complexo?**
R: Divida em sub-módulos menores, cada um com sua própria estrutura domain/application/infra/presentation.

**P: Melhor forma de fazer autenticação?**
R: Use JWT com decorators do Fastify + middleware de autenticação. Para OAuth, considere Supabase, Auth0, ou similar.

**P: Como fazer testes de integração?**
R: Use um banco de testes (migrations resetadas) e espere tudo terminar. Considere testcontainers para isolar testes.

---

**Versão**: 1.0  
**Última atualização**: Abril 2026  
**Autor**: Seu Time de Desenvolvimento
