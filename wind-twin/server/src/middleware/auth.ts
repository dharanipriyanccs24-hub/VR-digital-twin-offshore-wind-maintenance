import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'

export interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    email: string
  }
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' })
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as any
    req.user = { id: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
