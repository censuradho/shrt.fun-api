# Claude System Instructions - MV API

Você está trabalhando com uma API de encurtador de URLs. Arquitetura: **Clean Architecture + DDD**.

## 🏗️ Estrutura de Módulo (Padrão)

```
modules/<nome>/
├── index.ts                    # Exporta plugin
├── plugin.ts                   # Registra no Fastify
├── application/
│   ├── dtos/                   # Schemas Zod para validação
│   ├── use-cases/              # Lógica de aplicação (orquestração)
│   └── queries/                # Operações de leitura (CQRS)
├── domain/
│   ├── models/                 # Entidades de domínio
│   ├── repositories/           # IXyzRepository.ts (interfaces)
│   ├── services/               # Lógica de negócio pura
│   └── errors/                 # Mensagens de erro constantes
├── infra/
│   ├── repositories/           # Implementações concretas (Prisma)
│   ├── services/               # Serviços de integração
│   └── http-adapters/          # Adaptadores HTTP
└── presentation/
    ├── controllers/            # Handlers HTTP
    ├── factories/              # make<Nome>(...) para DI
    └── routes.ts               # Definição de rotas
```

## 📊 Fluxo de Requisição

```
HTTP Request
    ↓
routes.ts [Zod validation]
    ↓
controller [extract input, call use case]
    ↓
use-case [business logic, orchestrate]
    ↓
repository [database access]
    ↓
Prisma [query execution]
    ↓
HTTP Response [JSON serialized]
```

## 🎯 Regras de Implementação

### 1. **Dependency Injection (Sempre)**
```typescript
// ❌ ERRADO
export class UserService {
  private repo = new UserRepository();
}

// ✅ CORRETO
export class UserService {
  constructor(private readonly repo: IUserRepository) {}
}
```

### 2. **Interfaces para Acesso a Dados**
```typescript
// domain/repositories/IUserRepository.ts (Interface)
export interface IUserRepository {
  create(input: CreateUserDto): Promise<string>;
  findById(id: string): Promise<UserModel | null>;
}

// infra/repositories/user.repository.ts (Implementação)
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  // implementar métodos
}
```

### 3. **Use Cases - Orquestração**
```typescript
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: CreateUserDto): Promise<string> {
    // 1. Validar regras de negócio
    const exists = await this.userRepository.findByEmail(input.email);
    if (exists) throw new AppError('Email already exists', { status: 409 });

    // 2. Executar lógica
    const userId = await this.userRepository.create(input);

    // 3. Efeitos colaterais (enviar email, cache, etc)
    await this.emailService.sendWelcome(input.email);

    return userId;
  }
}
```

### 4. **Controllers - HTTP Adapter**
```typescript
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = request.body as CreateUserDto;
    const id = await this.createUserUseCase.execute(input);
    return reply.status(201).send({ id });
  }
}
```

### 5. **Factories - Container**
```typescript
export function makeUserController(): UserController {
  const userRepository = new UserRepository(prisma);
  const emailService = new EmailService();
  const createUserUseCase = new CreateUserUseCase(userRepository, emailService);
  return new UserController(createUserUseCase);
}
```

### 6. **Routes - HTTP Definition**
```typescript
export async function registerUserRoutes(app: FastifyInstance) {
  const controller = makeUserController();

  app.post<{ Body: CreateUserDto }>(
    '/',
    { schema: { body: CreateUserDto } },
    (req, reply) => controller.create(req, reply),
  );
}
```

## 📍 Naming Conventions

| O Quê | Formato | Exemplo |
|-------|---------|---------|
| Classes | `PascalCase` | `UserRepository` |
| Interfaces | `I` + `PascalCase` | `IUserRepository` |
| Methods | `camelCase` | `getUserById()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE` |
| Files | `kebab-case` | `user-repository.ts` |
| Directories | `kebab-case` | `use-cases/` |

## 🛡️ Error Handling

```typescript
// Sempre use AppError para erros esperados
throw new AppError(message, {
  status: 400,  // HTTP status
  code: 'ERROR_CODE', // Error code para cliente
});

// Propriedades disponíveis
- message: string (mensagem do erro)
- status: number (HTTP status code)
- code?: string (error identifier)
```

## ✅ Validação com Zod

```typescript
// application/dtos/create-user.dto.ts
import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

// Uso em routes
app.post(
  '/',
  { schema: { body: CreateUserDto } }, // Valida automaticamente
  handler,
);
```

## 🧪 Testes

```typescript
describe('CreateUserUseCase', () => {
  it('should create user when email is valid', async () => {
    // Arrange
    const mockRepo = { create: vi.fn(), findByEmail: vi.fn().mockResolvedValue(null) };
    const useCase = new CreateUserUseCase(mockRepo as any, emailService);

    // Act
    const id = await useCase.execute({ email: 'test@test.com', username: 'user', password: 'pass123' });

    // Assert
    expect(mockRepo.create).toHaveBeenCalled();
    expect(id).toBeDefined();
  });

  it('should throw if email already exists', async () => {
    const mockRepo = { findByEmail: vi.fn().mockResolvedValue({ id: '1' }) };
    const useCase = new CreateUserUseCase(mockRepo as any, emailService);

    await expect(useCase.execute({ email: 'existed@test.com' })).rejects.toThrow(AppError);
  });
});
```

## 🔄 Cache Strategy

```typescript
// domain/CacheGateway.ts (Interface)
export interface CacheGateway {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Uso
const cacheKey = `user:${id}`;
let user = await cache.get<UserModel>(cacheKey);
if (!user) {
  user = await repo.findById(id);
  if (user) await cache.set(cacheKey, user, 3600); // 1h TTL
}
return user;
```

## 🔐 Autenticação

```typescript
// Middleware via decorator
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ message: 'Unauthorized' });
  }
});

// Proteger rota
app.patch('/profile', { onRequest: [app.authenticate] }, handler);

// Acessar usuário
app.patch('/profile', { onRequest: [app.authenticate] }, async (request) => {
  const userId = request.user.id; // JWT payload
});
```

## 📚 Estrutura de Pastas Global

```
src/
├── @types/           # Extensões de tipos
├── domain/           # Interfaces globais (CacheGateway, EnvProvider, etc)
├── infra/
│   ├── cache/        # RedisCacheGateway
│   ├── config/       # Configurações centralizadas
│   ├── database/     # Prisma instance
│   ├── device/       # Device detection
│   ├── geolocation/  # Geo IP service
│   └── http/
│       └── plugins/  # Fastify plugins
├── main/
│   ├── app.ts        # Fastify setup
│   ├── error-handler.ts
│   └── server.ts     # Inicialização
├── modules/          # Bounded contexts
├── shared/
│   ├── constants/
│   ├── errors/       # AppError
│   ├── helpers/      # Utilidades
│   ├── kernel/
│   ├── types/
│   └── utils/
└── tests/
```

## 🚀 Ao Criar Novo Módulo

1. **domain/models/** → Defina entidades (interfaces)
2. **domain/repositories/** → Crie interfaces `IXyzRepository`
3. **domain/errors/** → Centralize mensagens de erro
4. **application/dtos/** → DTOs com validação Zod
5. **application/use-cases/** → Lógica de orquestração
6. **infra/repositories/** → Implemente `IXyzRepository` com Prisma
7. **presentation/controllers/** → Handlers HTTP
8. **presentation/factories/** → Crie `makeXyzController()`
9. **presentation/routes.ts** → Defina rotas
10. **plugin.ts** + **index.ts** → Exporte como plugin
11. **main/app.ts** → `app.register(xyzModule, { prefix: '/xyz' })`

## 🔗 Fluxo de Dependências (Acíclico)

```
✅ CORRETO: domain ← application ← infra ← presentation
❌ ERRADO: presentation → domain (circular!)
```

- Domain: sem dependências
- Application: depende de domain
- Infrastructure: depende de domain + application
- Presentation: depende de application

## 🎓 Resumo Rápido

- **Sempre** use dependency injection via constructor
- **Nunca** importe "para cima" na hierarquia
- **Sempre** use interfaces para abstrair acesso a dados
- **Sempre** valide com Zod antes de processar
- **Sempre** lance AppError para erros esperados
- **Sempre** implemente testes para use cases
- **Sempre** nomeie factories com `make<Classe>()`
- **Sempre** agrupe lógica relacionada em um módulo
