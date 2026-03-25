import { prisma } from "@/infra/database/prisma";

async function main() {
  await prisma.plan.upsert({
    where: { id: 'FREE' },
    update: { monthlyLinkLimit: 100 },
    create: {
      id: 'FREE', 
      name: 'FREE',
      monthlyLinkLimit: 100,
    },
  });

  await prisma.plan.upsert({
    where: { id: 'GROWTH' },
    update: { monthlyLinkLimit: 300 },
    create: {
      id: 'GROWTH',
      name: 'GROWTH',
      monthlyLinkLimit: 300,
    },
  });

  console.log('Seeded plans: FREE and GROWTH');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
