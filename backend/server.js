const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})
const port = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'ocean-sentinel-secret'

const turbines = Array.from({ length: 8 }, (_, i) => ({
  id: `A-${String(i + 1).padStart(2, '0')}`,
  name: `Wind Unit A-${String(i + 1).padStart(2, '0')}`,
  lat: 50 + Math.random() * 2,
  lon: 3 + Math.random() * 3,
  status: Math.random() > 0.12 ? 'active' : 'maintenance',
  health: Math.floor(70 + Math.random() * 30)
}))

const maintenance = [
  { turbine: 'A-01', service: 'Blade inspection', date: '2026-07-02', tech: 'A. Silva', status: 'scheduled' },
  { turbine: 'A-03', service: 'Gearbox check', date: '2026-06-12', tech: 'B. Khan', status: 'overdue' },
  { turbine: 'A-08', service: 'Electrical', date: '2026-08-01', tech: 'C. Mei', status: 'scheduled' },
  { turbine: 'A-05', service: 'Lubrication', date: '2026-05-22', tech: 'D. Lucas', status: 'completed' }
]

// Live sensor state — mutated each second
const sensors = {
  temperature: 12.4,
  windSpeed: 7.8,
  rotorSpeed: 9.2,
  vibration: 0.12,
  power: 1850
}

// Small random walk helper: clamp value within [min, max]
function jitter(current, delta, min, max) {
  const next = current + (Math.random() - 0.5) * 2 * delta
  return Math.max(min, Math.min(max, next))
}

// Simulate sensor drift every second and broadcast via Socket.IO
function startLiveTelemetry() {
  setInterval(() => {
    // Update sensors
    sensors.windSpeed    = +jitter(sensors.windSpeed,    0.3,  2.0,  18.0).toFixed(2)
    sensors.rotorSpeed   = +jitter(sensors.rotorSpeed,   0.2,  4.0,  15.0).toFixed(2)
    sensors.temperature  = +jitter(sensors.temperature,  0.4,  5.0,  28.0).toFixed(1)
    sensors.vibration    = +jitter(sensors.vibration,    0.008, 0.03, 0.6).toFixed(3)
    sensors.power        = +jitter(sensors.power,        35,  600,  2800).toFixed(0)

    // Drift turbine health slightly
    turbines.forEach(t => {
      t.health = Math.max(40, Math.min(100, t.health + (Math.random() - 0.5) * 0.8))
      // Very rarely toggle maintenance status
      if (Math.random() < 0.005) {
        t.status = t.status === 'active' ? 'maintenance' : 'active'
      }
    })

    // Broadcast to all connected clients
    io.emit('telemetry:update', {
      sensors,
      turbines: turbines.map(t => ({ id: t.id, health: +t.health.toFixed(1), status: t.status }))
    })
  }, 1000)
}

const db = require('./db')

// Seed default owner user if not exists
const existingOwner = db.getUserByEmail('owner@oceansentinel.local')
if (!existingOwner) {
  db.createUser({
    id: 'owner-1',
    email: 'owner@oceansentinel.local',
    passwordHash: bcrypt.hashSync('OwnerPass123', 10),
    name: 'Operations Owner',
    role: 'OWNER',
    isActive: true,
    createdAt: new Date().toISOString()
  })
}

// Seed default alerts if database is empty
const existingAlerts = db.getAlerts()
if (existingAlerts.length === 0) {
  db.createAlert({
    id: 'alert-1',
    turbine: 'A-03',
    level: 'warning',
    message: 'Yaw motor drift detected',
    createdAt: new Date().toISOString()
  })
  db.createAlert({
    id: 'alert-2',
    turbine: 'A-07',
    level: 'critical',
    message: 'High vibration on gearbox',
    createdAt: new Date().toISOString()
  })
}

app.use(express.json())

// CORS middleware to support local testing via file:// protocol
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.static(path.join(__dirname, '../frontend')))

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' })
  }
  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    if (req.user.role !== role && req.user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}

function sendEmail(to, subject, body) {
  db.recordEmail(to, subject, body)
  const message = { to, subject, body, sentAt: new Date().toISOString() }
  console.log('Email simulated:', message)
  return message
}

io.on('connection', socket => {
  socket.on('join:user', ({ userId }) => {
    socket.join(`user:${userId}`)
  })
})

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' })
  }

  const existing = db.getUserByEmail(email)
  if (existing) return res.status(409).json({ message: 'Email already registered' })

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    role: 'USER',
    isActive: false,
    createdAt: new Date().toISOString()
  }
  db.createUser(newUser)

  const owner = db.getUserByEmail('owner@oceansentinel.local')
  if (owner) {
    sendEmail(owner.email, 'Approval needed: new user registration', `User ${name} (${email}) requested access.`)
  }
  return res.status(201).json({ message: 'Registration request submitted. Owner must approve your account.' })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const user = db.getUserByEmail(email)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const passwordMatches = bcrypt.compareSync(password, user.passwordHash)
  if (!passwordMatches) return res.status(401).json({ message: 'Invalid credentials' })
  if (!user.isActive) return res.status(403).json({ message: 'Account pending owner approval' })

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '2h' })
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

app.get('/api/me', authenticate, (req, res) => {
  res.json(req.user)
})

app.get('/api/pending-users', authenticate, requireRole('OWNER'), (req, res) => {
  res.json(db.getPendingUsers())
})

app.post('/api/approve/:id', authenticate, requireRole('OWNER'), (req, res) => {
  const { id } = req.params
  const user = db.getUserById(id)
  if (!user || user.isActive === 1) return res.status(404).json({ message: 'Pending user not found' })

  db.activateUser(id, req.user.id)
  sendEmail(user.email, 'Account approved', 'Your account has been approved by the owner. You can now log in.')
  io.to(`user:${user.id}`).emit('alert:personal', { type: 'approval', message: 'Your account has been approved.' })
  return res.json({ message: 'User approved', user: { id: user.id, email: user.email, name: user.name } })
})

app.get('/api/notifications', authenticate, (req, res) => {
  const history = db.getEmailHistory()
  res.json(history.map(h => ({ to: h.recipient, subject: h.subject, body: h.body, sentAt: h.sentAt })))
})

app.get('/api/alerts', authenticate, (req, res) => {
  res.json(db.getAlerts())
})

app.post('/api/alerts', authenticate, (req, res) => {
  const { turbine, level, message } = req.body
  const alert = {
    id: `alert-${Date.now()}`,
    turbine: turbine || 'T-01',
    level: level || 'info',
    message: message || 'Manual alert created by user',
    createdAt: new Date().toISOString()
  }
  db.createAlert(alert)
  io.emit('alert:new', alert)
  if (req.user) {
    io.to(`user:${req.user.id}`).emit('alert:personal', alert)
  }
  return res.status(201).json(alert)
})

app.get('/api/turbines', (req, res) => {
  res.json(turbines)
})

app.get('/api/sensors', (req, res) => {
  res.json(sensors)
})

app.get('/api/maintenance', (req, res) => {
  res.json(maintenance)
})

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
  startLiveTelemetry()
})
