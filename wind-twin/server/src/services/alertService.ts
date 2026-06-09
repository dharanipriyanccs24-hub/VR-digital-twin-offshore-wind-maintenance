import { prisma } from '../config/database'

export async function getAlerts(where: any = {}) {
  return prisma.alert.findMany({ where })
}

export async function createAlert(data: any) {
  return prisma.alert.create({ data })
}
