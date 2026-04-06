import { PrismaPg } from "@prisma/adapter-pg";
import { envProvider } from "../config/ProcessEnvProvider";
import { PrismaClient } from "@/generated/prisma/client";


const adapter = new PrismaPg({ 
  connectionString: envProvider.get('DATABASE_URL'),
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

export { prisma };
