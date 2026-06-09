import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { config } from '../config/env'
import { prisma } from '../config/database'
import { sendAlertEmail } from '../services/emailService'
import { authenticateJWT } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return res.status(401).json({ message: 'Invalid credentials' })
  if (!user.isActive) return res.status(403).json({ message: 'Account pending approval by owner' })
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

router.post('/register', async (req, res) => {
  const { email, password, name, role = 'OPERATOR' } = req.body
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ message: 'Email already registered' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, passwordHash, name, role } })

  // notify admins/owners to approve
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
    const subject = `New user registration: ${name} <${email}>`
    const text = `A new user has registered and requires approval: ${name} (${email}). User id: ${user.id}`
    admins.forEach(a => {
      if (a.email) sendAlertEmail(a.email, subject, text)
    })
  } catch (err) {
    console.error('Failed to notify admins of new registration', err)
  }

  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.isActive })
})

// Admin/Owner approves a pending user
router.post('/approve/:id', authenticateJWT, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params
  const approver = req.user!
  const user = await prisma.user.update({ where: { id }, data: { isActive: true, approvedById: approver.id } })
  // notify user by email
  if (user.email) {
    try {
      await sendAlertEmail(user.email, 'Account approved', `Your account has been approved by ${approver.email}. You can now log in.`)
    } catch (err) {
      console.error('Failed to send approval email', err)
    }
  }
  res.json({ id: user.id, isActive: user.isActive })
})

router.post('/refresh', (req, res) => {
  res.json({ token: 'refresh-token-placeholder' })
})

export default router
