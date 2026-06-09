import nodemailer from 'nodemailer'
import { config } from '../config/env'

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT) || 587,
  secure: config.SMTP_SECURE === 'true',
  auth: config.SMTP_USER && config.SMTP_PASS ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined
})

export async function sendAlertEmail(to: string, subject: string, text: string, html?: string) {
  if (!to) return
  const msg = {
    from: config.EMAIL_FROM || 'no-reply@oceansentinel.local',
    to,
    subject,
    text,
    html
  }
  try {
    const info = await transporter.sendMail(msg)
    console.log('Alert email sent', info.messageId)
    return info
  } catch (err) {
    console.error('Failed to send alert email', err)
    throw err
  }
}

export default { sendAlertEmail }
