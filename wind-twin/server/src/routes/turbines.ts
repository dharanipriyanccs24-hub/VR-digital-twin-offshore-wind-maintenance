import { Router } from 'express'
import { prisma } from '../config/database'

const router = Router()

router.get('/', async (req, res) => {
  const turbines = await prisma.turbine.findMany()
  res.json(turbines)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const turbine = await prisma.turbine.findUnique({ where: { id } })
  if (!turbine) return res.status(404).json({ message: 'Turbine not found' })
  res.json(turbine)
})

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const turbine = await prisma.turbine.update({ where: { id }, data: { status } })
  res.json(turbine)
})

export default router
