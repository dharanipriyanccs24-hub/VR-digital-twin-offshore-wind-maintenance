import { prisma } from '../config/database'

export async function getTurbines() {
  return prisma.turbine.findMany()
}

export async function getTurbineById(id: string) {
  return prisma.turbine.findUnique({ where: { id } })
}
