import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server as SocketIOServer } from 'socket.io'
import { config } from './config/env'
import { createRedisClient } from './config/redis'
import { prisma } from './config/database'
import { socketServer } from './websocket/server'
import authRoutes from './routes/auth'
import turbineRoutes from './routes/turbines'
import telemetryRoutes from './routes/telemetry'
import alertRoutes from './routes/alerts'
import workOrderRoutes from './routes/workorders'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ['GET', 'POST']
  }
})

app.use(cors({ origin: config.CLIENT_URL }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/turbines', turbineRoutes)
app.use('/api/telemetry', telemetryRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/workorders', workOrderRoutes)

app.use(errorHandler)

socketServer(io)

// expose io via app locals so routes can emit
app.set('io', io)

server.listen(config.PORT, () => {
  console.log(`Server listening on http://localhost:${config.PORT}`)
})
