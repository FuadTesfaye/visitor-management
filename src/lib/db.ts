import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import { PrismaLibSQL } from '@prisma/adapter-better-sqlite3'

function createPrismaClient() {
  const db = new Database('./prisma/dev.db')
  const adapter = new PrismaLibSQL(db)
  return new PrismaClient({ adapter })
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof createPrismaClient> | undefined
}

const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma }
export default prisma
