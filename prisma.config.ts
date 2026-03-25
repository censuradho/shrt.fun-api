import { envProvider } from './src/infra/config/ProcessEnvProvider';
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: process.env.NODE_ENV === 'production'
      ? "node dist/prisma/seed.js"
      : "tsx -r tsconfig-paths/register prisma/seed.ts"
  },
  datasource: {
    url:  envProvider.get("DATABASE_URL"),
  },
});
