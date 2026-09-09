const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRaw`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'Notification';
  `
  console.log(result)
}
main().finally(() => prisma.$disconnect())
