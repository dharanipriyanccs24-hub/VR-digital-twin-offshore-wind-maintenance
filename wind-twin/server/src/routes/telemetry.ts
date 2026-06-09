import { Router } from 'express'

const router = Router()

router.get('/:id/history', async (req, res) => {
  const { id } = req.params
  const { sensor = 'rpm', hours = '24', interval = '1m' } = req.query
  res.json({ turbineId: id, sensor, hours, interval, data: [] })
})

router.get('/:id/latest', async (req, res) => {
  const { id } = req.params
  res.json({ turbineId: id, timestamp: new Date(), values: {} })
})

export default router
