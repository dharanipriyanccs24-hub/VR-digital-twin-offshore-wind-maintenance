import { prisma } from '../config/database'

export async function getWorkOrders(where: any = {}) {
  return prisma.workOrder.findMany({ where })
}

export async function createWorkOrder(data: any) {
  return prisma.workOrder.create({ data })
}
