import { Router } from 'express'
import { prisma } from '../config/database'
import { sendAlertEmail } from '../services/emailService'

const router = Router()

router.get('/', async (req, res) => {
  const { turbineId, severity, resolved } = req.query
  const where: any = {}
  if (turbineId) where.turbineId = turbineId
  if (severity) where.severity = severity
  if (resolved === 'true') where.resolvedAt = { not: null }
  if (resolved === 'false') where.resolvedAt = null
  const alerts = await prisma.alert.findMany({ where })
  res.json(alerts)
})

router.post('/', async (req, res) => {
  const { title, message, turbineId, severity = 'INFO', notifyUserId, sensor = 'system', value = 0, threshold = 0 } = req.body
  const sev = String(severity).toUpperCase()
  const data: any = {
    turbineId: turbineId || 'unknown',
    sensor,
    severity: sev,
    message: message || title || 'Alert',
    value: Number(value) || 0,
    threshold: Number(threshold) || 0
  }

  const alert = await prisma.alert.create({ data })

  // emit realtime event to connected clients and optionally to user room
  const io = req.app.get('io')
  if (io) {
    io.emit('alert:new', alert)
    if (notifyUserId) io.to(`user:${notifyUserId}`).emit('alert:personal', alert)
  }

  // send email if a notify user id is provided
  if (notifyUserId) {
    const user = await prisma.user.findUnique({ where: { id: notifyUserId } })
    if (user && user.email) {
      try {
        await sendAlertEmail(user.email, `Alert: ${title}`, message)
      } catch (err) {
        console.error('Email send failed for alert', err)
      }
    }
  }

  res.status(201).json(alert)
})

router.patch('/:id/acknowledge', async (req, res) => {
  const { id } = req.params
  const alert = await prisma.alert.update({ where: { id }, data: { acknowledgedById: 'user-1' } })
  res.json(alert)
})

router.patch('/:id/resolve', async (req, res) => {
  const { id } = req.params
  const alert = await prisma.alert.update({ where: { id }, data: { resolvedAt: new Date() } })
  res.json(alert)
})

export default router
