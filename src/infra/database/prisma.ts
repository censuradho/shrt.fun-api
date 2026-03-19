import { PrismaPg } from "@prisma/adapter-pg";
import { envProvider } from "../config/ProcessEnvProvider";
import { PrismaClient } from "prisma/generated/client";


const adapter = new PrismaPg({ connectionString: envProvider.get('DATABASE_URL') });
const prisma = new PrismaClient({ adapter });

export { prisma };
