import { Router } from 'express'
import { prisma } from '../config/database'

const router = Router()

router.get('/', async (req, res) => {
  const { turbineId, status, priority } = req.query
  const where: any = {}
  if (turbineId) where.turbineId = turbineId
  if (status) where.status = status
  if (priority) where.priority = priority
  const orders = await prisma.workOrder.findMany({ where })
  res.json(orders)
})

router.post('/', async (req, res) => {
  const payload = req.body
  const workOrder = await prisma.workOrder.create({ data: payload })
  res.status(201).json(workOrder)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const workOrder = await prisma.workOrder.findUnique({ where: { id } })
  if (!workOrder) return res.status(404).json({ message: 'Work order not found' })
  res.json(workOrder)
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const update = req.body
  const workOrder = await prisma.workOrder.update({ where: { id }, data: update })
  res.json(workOrder)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  await prisma.workOrder.delete({ where: { id } })
  res.status(204).send()
})

export default router
