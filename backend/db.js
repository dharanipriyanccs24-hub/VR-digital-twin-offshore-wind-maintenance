const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, 'db.json')

// Helper to read database
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { users: [], alerts: [], emails: [] }
    }
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error reading database file, returning empty state:', err)
    return { users: [], alerts: [], emails: [] }
  }
}

// Helper to write database
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing database file:', err)
  }
}

function getUserByEmail(email) {
  const db = readDb()
  return db.users.find(u => u.email === email) || null
}

function getUserById(id) {
  const db = readDb()
  return db.users.find(u => u.id === id) || null
}

function createUser(user) {
  const db = readDb()
  const newUser = {
    ...user,
    isActive: user.isActive ? 1 : 0
  }
  db.users.push(newUser)
  writeDb(db)
}

function activateUser(id, approvedBy) {
  const db = readDb()
  const user = db.users.find(u => u.id === id)
  if (user) {
    user.isActive = 1
    user.approvedBy = approvedBy
    user.approvedAt = new Date().toISOString()
    writeDb(db)
  }
}

function getPendingUsers() {
  const db = readDb()
  return db.users
    .filter(u => u.isActive === 0)
    .map(u => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt }))
}

function createAlert(alert) {
  const db = readDb()
  db.alerts.unshift(alert)
  writeDb(db)
}

function getAlerts() {
  const db = readDb()
  return db.alerts.slice(0, 20)
}

function recordEmail(recipient, subject, body) {
  const db = readDb()
  db.emails.unshift({
    id: `email-${Date.now()}`,
    recipient,
    subject,
    body,
    sentAt: new Date().toISOString()
  })
  writeDb(db)
}

function getEmailHistory() {
  const db = readDb()
  return db.emails.slice(0, 20)
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  activateUser,
  getPendingUsers,
  getAlerts,
  createAlert,
  recordEmail,
  getEmailHistory
}
