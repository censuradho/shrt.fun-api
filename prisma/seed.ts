import { prisma } from '../src/infra/database/prisma'

async function main() {
  await prisma.plan.upsert({
    where: { id: 'plan_free' },
    update: {},
    create: {
      id: 'plan_free',
      name: 'FREE',
      monthlyLinkLimit: 60,
    },
  })

  await prisma.plan.upsert({
    where: { id: 'plan_growth' },
    update: {},
    create: {
      id: 'plan_growth',
      name: 'GROWTH',
      monthlyLinkLimit: 500,
    },
  })

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
