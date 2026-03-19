import { envProvider } from './src/infra/config/ProcessEnvProvider';
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:  envProvider.get("DATABASE_URL"),
  },
});
