const fleet = Array.from({ length: 8 }, (_, i) => {
  const id = `A-${String(i + 1).padStart(2, '0')}`
  return {
    id,
    name: `Wind Unit ${id}`,
    status: ['online', 'warn', 'fault', 'maint'][Math.floor(Math.random() * 4)],
    health: Math.floor(74 + Math.random() * 22),
    direction: ['NNE', 'ESE', 'SSE', 'WNW'][i % 4]
  }
})

const metrics = {
  rotor: 9.4,
  wind: 7.8,
  power: 1860,
  vibration: 0.12,
  temperature: 68,
  health: 87.3
}

const wear = {
  blade: 22,
  gearbox: 33,
  bearing: 18,
  pile: 12
}

let selectedTurbine = fleet[0].id
let emergencyActive = false
let vrEnabled = false
let currentPowerSeries = Array.from({ length: 24 }, (_, i) => Math.floor(1200 + 600 * Math.sin(i / 3) + Math.random() * 180))
let token = localStorage.getItem('authToken')
let currentUser = localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser')) : null
let socket = null
let alerts = []
const logEntries = [
  '14:34 - Remote diagnostics heartbeat online.',
  '14:33 - Dispatch queue updated for maintenance window.',
  '14:31 - Nacelle temperature nominal on A-03.',
  '14:29 - Blade integrity scan complete.',
  '14:28 - Vessel transfer route confirmed.'
]

const faultDetails = {
  'A-01': { code: 'FLT-102', desc: 'Blade pitch actuator calibration error. High asymmetry load.', time: '12 minutes ago' },
  'A-02': { code: 'FLT-208', desc: 'Nacelle temperature warning. Cooling pump manifold block.', time: '25 minutes ago' },
  'A-03': { code: 'FLT-304', desc: 'Gearbox high vibration amplitude at 23Hz. Bearing wear threshold exceeded.', time: '4 minutes ago' },
  'A-04': { code: 'FLT-401', desc: 'Generator stator circuit insulation resistance low.', time: '1 hour ago' },
  'A-05': { code: 'FLT-509', desc: 'Monopile structural strain sensor anomaly detected.', time: '45 minutes ago' },
  'A-06': { code: 'FLT-612', desc: 'Yaw drive motor torque limit reached. High wind resistance friction.', time: '8 minutes ago' },
  'A-07': { code: 'FLT-704', desc: 'Emergency hydraulic brake pressure loss.', time: '2 minutes ago' },
  'A-08': { code: 'FLT-811', desc: 'Anemometer sensor telemetry communication failure.', time: '30 minutes ago' },
}

let totalRevolutions = 1482904
let totalEnergy = 84.2903
let maintenanceRecords = []

const calloutDetails = {
  blade: {
    title: 'Blade Integrity Map',
    message: 'Area of tip erosion detected. Thermal scan indicates a 16% wear gradient along the outer blade edge.'
  },
  nacelle: {
    title: 'Nacelle Temperature Alert',
    message: 'Thermal hotspot registered in the nacelle cooling manifold. Root-cause likely blocked ventilation inlet.'
  },
  gearbox: {
    title: 'Gearbox Health',
    message: 'High-frequency vibration spectrum shows elevated amplitude at 23 Hz. Bearings operating at 72% load.'
  },
  monopile: {
    title: 'Monopile Status',
    message: 'Foundation stress remains low at 16%. Fatigue model indicates no immediate action required.'
  }
}

const $ = sel => document.querySelector(sel)
const $$ = sel => Array.from(document.querySelectorAll(sel))

// ===================== THREE.JS STATE =====================
let scene, renderer
let cameraL, cameraR
let turbineGroup, towerMesh, nacelleMesh, rotorGroup, bladeMeshes = []
let towerMaterial, nacelleMaterial, bladeMaterial
let mainShaftMesh, generatorMesh, gearboxMesh, gear1Mesh, gear2Mesh, generatorStator
let controls
let threeInitialized = false
let currentViewMode = 'twin'
let rotorRotationSpeed = 0.02

// ===================== THREE.JS INIT =====================
function initThree() {
  const container = document.getElementById('canvasContainer')
  if (!container) return

  const width = container.clientWidth || 960
  const height = container.clientHeight || 520

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x030d17)
  scene.fog = new THREE.Fog(0x030d17, 40, 90)

  // Camera
  const aspect = width / height
  cameraL = new THREE.PerspectiveCamera(42, aspect, 0.1, 150)
  cameraL.position.set(3, 6, 18)
  cameraL.lookAt(0, 4, 0)

  cameraR = new THREE.PerspectiveCamera(42, aspect, 0.1, 150)
  cameraR.position.copy(cameraL.position)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const dir1 = new THREE.DirectionalLight(0xffffff, 0.9)
  dir1.position.set(12, 24, 18)
  dir1.castShadow = true
  scene.add(dir1)
  const dir2 = new THREE.DirectionalLight(0x35b7ff, 0.4)
  dir2.position.set(-12, -5, -12)
  scene.add(dir2)
  const pLight = new THREE.PointLight(0xf1c40f, 0.8, 8)
  pLight.position.set(0, 6, -0.6)
  scene.add(pLight)

  // Ocean floor grid
  const grid = new THREE.GridHelper(80, 40, 0x35b7ff, 0x0a1a26)
  grid.position.y = -6.5
  scene.add(grid)

  // Ocean plane
  const oceanGeom = new THREE.PlaneGeometry(100, 100)
  const oceanMat = new THREE.MeshStandardMaterial({ color: 0x021020, roughness: 0.8, metalness: 0.1, transparent: true, opacity: 0.85 })
  const ocean = new THREE.Mesh(oceanGeom, oceanMat)
  ocean.rotation.x = -Math.PI / 2
  ocean.position.y = -6.5
  scene.add(ocean)

  // ========== MATERIALS ==========
  towerMaterial = new THREE.MeshStandardMaterial({ color: 0x1a2e3d, roughness: 0.45, metalness: 0.8 })
  nacelleMaterial = new THREE.MeshStandardMaterial({
    color: 0x4c8db5,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x8ad9ff, roughness: 0.5, metalness: 0.3 })
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x145f8f, roughness: 0.3, metalness: 0.7 })

  // ========== TURBINE GROUP ==========
  turbineGroup = new THREE.Group()
  scene.add(turbineGroup)

  // Tower
  const towerGeom = new THREE.CylinderGeometry(0.32, 0.65, 13, 18)
  towerMesh = new THREE.Mesh(towerGeom, towerMaterial)
  towerMesh.position.y = 0.5
  towerMesh.castShadow = true
  turbineGroup.add(towerMesh)

  // Transparent nacelle outer casing (glassmorphic - watch inside)
  const nacelleGeom = new THREE.BoxGeometry(1.4, 1.25, 2.6)
  nacelleMesh = new THREE.Mesh(nacelleGeom, nacelleMaterial)
  nacelleMesh.position.set(0, 7, 0.2)
  turbineGroup.add(nacelleMesh)

  // ========== NACELLE INTERNALS (drivetrain) ==========
  const internals = new THREE.Group()
  internals.position.set(0, 7, 0.2)
  turbineGroup.add(internals)

  // Main low-speed shaft
  const shaftGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 12)
  shaftGeom.rotateX(Math.PI / 2)
  mainShaftMesh = new THREE.Mesh(shaftGeom, new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.95 }))
  mainShaftMesh.position.set(0, 0.05, 0.5)
  internals.add(mainShaftMesh)

  // Gearbox casing (semi-transparent amber)
  const gbGeom = new THREE.BoxGeometry(1.0, 0.85, 0.9)
  gearboxMesh = new THREE.Mesh(gbGeom, new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5, metalness: 0.8, transparent: true, opacity: 0.45 }))
  gearboxMesh.position.set(0, 0, -0.35)
  internals.add(gearboxMesh)

  // Large low-speed gear
  const g1Geom = new THREE.CylinderGeometry(0.30, 0.30, 0.14, 20)
  g1Geom.rotateX(Math.PI / 2)
  gear1Mesh = new THREE.Mesh(g1Geom, new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.3, metalness: 0.85 }))
  gear1Mesh.position.set(-0.16, 0.05, -0.35)
  internals.add(gear1Mesh)

  // Small high-speed gear
  const g2Geom = new THREE.CylinderGeometry(0.12, 0.12, 0.16, 14)
  g2Geom.rotateX(Math.PI / 2)
  gear2Mesh = new THREE.Mesh(g2Geom, new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.2, metalness: 0.9 }))
  gear2Mesh.position.set(0.19, 0.05, -0.35)
  internals.add(gear2Mesh)

  // Generator stator outer casing (copper, semi-transparent)
  const statorGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.7, 18)
  statorGeom.rotateX(Math.PI / 2)
  generatorStator = new THREE.Mesh(statorGeom, new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.4, metalness: 0.8, transparent: true, opacity: 0.32 }))
  generatorStator.position.set(0, 0.05, -0.95)
  internals.add(generatorStator)

  // Generator inner rotor core (golden yellow, emissive glow)
  const rotorGeom = new THREE.CylinderGeometry(0.20, 0.20, 0.72, 14)
  rotorGeom.rotateX(Math.PI / 2)
  generatorMesh = new THREE.Mesh(rotorGeom, new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.15, metalness: 0.95, emissive: 0xe67e22, emissiveIntensity: 0.35 }))
  generatorMesh.position.set(0, 0.05, -0.95)
  internals.add(generatorMesh)

  // ========== ROTOR HUB + BLADES ==========
  rotorGroup = new THREE.Group()
  rotorGroup.position.set(0, 7, 1.55)
  turbineGroup.add(rotorGroup)

  const hubMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 18, 18), hubMat)
  hubMesh.rotation.x = Math.PI / 2
  rotorGroup.add(hubMesh)

  bladeMeshes = []
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3
    const holder = new THREE.Group()
    holder.rotation.z = angle
    const bladeGeom = new THREE.BoxGeometry(0.16, 5.2, 0.07)
    const blade = new THREE.Mesh(bladeGeom, bladeMaterial)
    blade.position.y = 2.6
    blade.castShadow = true
    holder.add(blade)
    rotorGroup.add(holder)
    bladeMeshes.push(blade)
  }

  // ========== ORBIT CONTROLS (360° drag-to-rotate) ==========
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(cameraL, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = true
    controls.minDistance = 1.2   // Can zoom inside the nacelle!
    controls.maxDistance = 55
    controls.maxPolarAngle = Math.PI / 2.05
    controls.target.set(0, 5, 0)
    controls.update()
  }

  // ========== ANIMATION LOOP ==========
  function animate() {
    requestAnimationFrame(animate)

    // Blade spin tied to wind telemetry
    const targetSpeed = emergencyActive ? 0 : metrics.wind * 0.0035
    rotorRotationSpeed += (targetSpeed - rotorRotationSpeed) * 0.06
    rotorGroup.rotation.z -= rotorRotationSpeed

    // Internal mechanics animation (synced with blade rotation)
    mainShaftMesh.rotation.y = -rotorGroup.rotation.z
    gear1Mesh.rotation.y = -rotorGroup.rotation.z
    gear2Mesh.rotation.y = rotorGroup.rotation.z * 4.5       // Gearbox step-up ratio
    generatorMesh.rotation.y = -rotorGroup.rotation.z * 15.0 // Generator at high-speed output

    // Vibration mode oscillation of nacelle
    if (currentViewMode === 'vibration') {
      const t = Date.now() * 0.07
      const intensity = metrics.vibration * 10
      nacelleMesh.position.x = Math.sin(t) * 0.06 * intensity
      nacelleMesh.position.z = 0.2 + Math.cos(t * 0.8) * 0.06 * intensity
      internals.position.x = nacelleMesh.position.x
      internals.position.z = 0.2 + (nacelleMesh.position.z - 0.2)
      rotorGroup.position.x = nacelleMesh.position.x
      rotorGroup.position.z = 1.55 + (nacelleMesh.position.z - 0.2)
    } else {
      nacelleMesh.position.set(0, 7, 0.2)
      internals.position.set(0, 7, 0.2)
      rotorGroup.position.set(0, 7, 1.55)
    }

    if (controls) controls.update()

    // Sync cameraR for stereoscopic VR split-screen
    cameraR.position.copy(cameraL.position)
    cameraR.quaternion.copy(cameraL.quaternion)
    cameraR.translateX(0.32) // interpupillary distance offset

    const w = container.clientWidth || 960
    const h = container.clientHeight || 520

    if (vrEnabled) {
      renderer.setScissorTest(true)
      renderer.setViewport(0, 0, w / 2, h)
      renderer.setScissor(0, 0, w / 2, h)
      renderer.render(scene, cameraL)
      renderer.setViewport(w / 2, 0, w / 2, h)
      renderer.setScissor(w / 2, 0, w / 2, h)
      renderer.render(scene, cameraR)
    } else {
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, w, h)
      renderer.render(scene, cameraL)
    }
  }

  window.addEventListener('resize', () => {
    const w = container.clientWidth || 960
    const h = container.clientHeight || 520
    renderer.setSize(w, h)
    cameraL.aspect = (vrEnabled ? w / 2 : w) / h
    cameraL.updateProjectionMatrix()
    cameraR.aspect = cameraL.aspect
    cameraR.updateProjectionMatrix()
  })

  animate()
  threeInitialized = true
}

// ===================== VIEW MODE SWITCH =====================
function changeViewMode(view) {
  currentViewMode = view
  if (!threeInitialized) return

  if (view === 'thermal') {
    towerMesh.material = new THREE.MeshBasicMaterial({ color: 0x053cd6 })
    nacelleMesh.material = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.18 })
    mainShaftMesh.material = new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    gearboxMesh.material = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.45 })
    gear1Mesh.material = new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    gear2Mesh.material = new THREE.MeshBasicMaterial({ color: 0xffd900 })
    generatorStator.material = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.32 })
    generatorMesh.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    rotorGroup.children[0].material = new THREE.MeshBasicMaterial({ color: 0xff8800 })
    bladeMeshes.forEach(b => { b.material = new THREE.MeshBasicMaterial({ color: 0x00f3ff }) })
    scene.background = new THREE.Color(0x01050a)
  } else if (view === 'vibration') {
    towerMesh.material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
    nacelleMesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.18 })
    mainShaftMesh.material = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true })
    gearboxMesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true })
    gear1Mesh.material = new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true })
    gear2Mesh.material = new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true })
    generatorStator.material = new THREE.MeshBasicMaterial({ color: 0xff5500, wireframe: true })
    generatorMesh.material = new THREE.MeshBasicMaterial({ color: 0xff3300, wireframe: true })
    rotorGroup.children[0].material = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true })
    bladeMeshes.forEach(b => { b.material = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true }) })
    scene.background = new THREE.Color(0x02070f)
  } else {
    towerMesh.material = towerMaterial
    nacelleMesh.material = nacelleMaterial
    mainShaftMesh.material = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.95 })
    gearboxMesh.material = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5, metalness: 0.8, transparent: true, opacity: 0.45 })
    gear1Mesh.material = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.3, metalness: 0.85 })
    gear2Mesh.material = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.2, metalness: 0.9 })
    generatorStator.material = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.4, metalness: 0.8, transparent: true, opacity: 0.32 })
    generatorMesh.material = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.15, metalness: 0.95, emissive: 0xe67e22, emissiveIntensity: 0.35 })
    rotorGroup.children[0].material = new THREE.MeshStandardMaterial({ color: 0x145f8f, roughness: 0.3, metalness: 0.7 })
    bladeMeshes.forEach(b => { b.material = bladeMaterial })
    scene.background = new THREE.Color(0x030d17)
  }
}

// ===================== API + AUTH =====================
const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === '') ? 'http://localhost:3000' : '';

function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  return fetch(url, { ...options, headers })
}

function setAuth(user, authToken) {
  currentUser = user
  token = authToken
  localStorage.setItem('authToken', token)
  localStorage.setItem('authUser', JSON.stringify(user))
  renderApp()
  connectSocket()
}

function clearAuth() {
  currentUser = null
  token = null
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
  if (socket) {
    socket.disconnect()
    socket = null
  }
  renderApp()
}

function renderApp() {
  const authOverlay = $('#authOverlay')
  const dashboard = $('#dashboard')
  if (currentUser && token) {
    authOverlay.classList.add('hidden')
    dashboard.classList.remove('hidden')
    fetchAppState()
  } else {
    authOverlay.classList.remove('hidden')
    dashboard.classList.add('hidden')
  }
}

async function fetchAppState() {
  fetchMaintenanceRecords()
  renderFleet()
  renderLogFeed()
  renderAlerts()
  renderTrackers()
  updateSelectedInfo()
  drawPowerChart(currentPowerSeries)
  setupCallouts()
  setupTabs()
  setupPointerParallax()

  if (!threeInitialized) {
    setTimeout(initThree, 100)
  } else {
    window.dispatchEvent(new Event('resize'))
  }

  if (currentUser && currentUser.role === 'OWNER') {
    fetchPendingUsers()
  }
}

async function connectSocket() {
  if (!token || !currentUser) return
  if (socket) socket.disconnect()
  const socketUrl = (window.location.protocol === 'file:' || window.location.hostname === '') ? 'http://localhost:3000' : undefined
  socket = io(socketUrl, { auth: { token } })
  socket.on('connect', () => {
    socket.emit('join:user', { userId: currentUser.id })
  })
  socket.on('alert:new', alert => {
    alerts.unshift(alert)
    if (alerts.length > 10) alerts.pop()
    renderAlertFeed()
    showToast('Realtime alert', alert.message)
  })
  socket.on('alert:personal', alert => {
    alerts.unshift(alert)
    if (alerts.length > 10) alerts.pop()
    renderAlertFeed()
    showToast('Personal alert', alert.message)
  })
  socket.on('telemetry:update', data => {
    if (data.sensors) {
      metrics.wind = data.sensors.windSpeed || metrics.wind
      metrics.rotor = data.sensors.rotorSpeed || metrics.rotor
      metrics.vibration = data.sensors.vibration || metrics.vibration
      metrics.power = data.sensors.power || metrics.power
      metrics.temperature = data.sensors.temperature || metrics.temperature
      
      updateSelectedInfo()
      updateLiveCounters(data.sensors.rotorSpeed || 0, data.sensors.power || 0)
    }
  })
}

function renderFleet() {
  const list = $('#fleetList')
  list.innerHTML = ''
  fleet.forEach(unit => {
    const item = document.createElement('button')
    item.className = `fleet-item${unit.id === selectedTurbine ? ' active' : ''}`
    item.innerHTML = `
      <div>
        <h3>${unit.id}</h3>
        <p>${unit.name} - ${unit.direction}</p>
      </div>
      <span class="status-pill ${unit.status}">${unit.status.toUpperCase()}</span>
    `
    item.addEventListener('click', () => selectTurbine(unit.id))
    list.appendChild(item)
  })
}

function renderLogFeed() {
  const feed = $('#logFeed')
  feed.innerHTML = ''
  logEntries.forEach(entry => {
    const div = document.createElement('div')
    div.className = 'log-entry'
    div.textContent = entry
    feed.appendChild(div)
  })
}

function renderAlerts() {
  const alertFeed = $('#alertFeed')
  if (!alerts.length) {
    alertFeed.innerHTML = `<div class="alert-item info"><strong>No active alerts</strong><p>All systems operating within normal thresholds.</p></div>`
    return
  }
  alertFeed.innerHTML = alerts.slice(0, 10).map(alert => `
    <div class="alert-item ${alert.level || 'info'}">
      <strong>${alert.turbine || 'System'} — ${alert.level?.toUpperCase() || 'INFO'}</strong>
      <p>${alert.message || alert.detail}</p>
    </div>
  `).join('')
}

function renderAlertFeed() {
  renderAlerts()
}

function renderApprovalList(users) {
  const approvalList = $('#approvalList')
  approvalList.innerHTML = ''
  if (!users.length) {
    approvalList.innerHTML = '<div class="alert-item info"><strong>No pending approvals</strong><p>All registration requests have been handled.</p></div>'
    return
  }
  users.forEach(user => {
    const item = document.createElement('div')
    item.className = 'approval-item'
    item.innerHTML = `
      <div>
        <strong>${user.name}</strong>
        <div>${user.email}</div>
      </div>
      <button class="button secondary approve-btn" data-id="${user.id}">Approve</button>
    `
    approvalList.appendChild(item)
  })
  $$('.approve-btn').forEach(button => {
    button.addEventListener('click', () => approveUser(button.dataset.id))
  })
}

async function fetchPendingUsers() {
  try {
    const response = await apiFetch('/api/pending-users')
    if (!response.ok) throw new Error('Failed to load pending requests')
    const users = await response.json()
    renderApprovalList(users)
    $('#ownerRequests').classList.remove('hidden')
  } catch (err) {
    console.error(err)
    $('#ownerRequests').classList.add('hidden')
  }
}

async function approveUser(id) {
  try {
    const response = await apiFetch(`/api/approve/${id}`, { method: 'POST' })
    if (!response.ok) throw new Error('Approve failed')
    await fetchPendingUsers()
    showToast('User approved', 'The account has been activated and the user will receive a notification.')
  } catch (err) {
    console.error(err)
    showToast('Approve failed', err.message)
  }
}

function updateSelectedInfo() {
  const unit = fleet.find(f => f.id === selectedTurbine)
  if (!unit) return
  $('#selectedTurbine').textContent = unit.id
  $('#selectedStatus').textContent = unit.status.toUpperCase()
  $('#selectedStatus').className = `status-pill ${unit.status}`
  $('#healthScore').textContent = metrics.health.toFixed(1)
  $('#healthScoreBig').textContent = metrics.health.toFixed(1)
  $('#metricRotor').textContent = `${metrics.rotor.toFixed(1)}k`
  $('#metricWind').textContent = `${metrics.wind.toFixed(1)} m/s`
  $('#metricPower').textContent = `${Math.round(metrics.power / 10) / 100} MW`
  $('#metricVibration').textContent = `${metrics.vibration.toFixed(2)} g`
  $('#hudBlade').textContent = `${100 - wear.blade}%`
  $('#hudTemp').textContent = `${metrics.temperature.toFixed(0)}°C`
  $('#hudGear').textContent = `${100 - wear.gearbox}%`
  $('#hudMonopile').textContent = `${100 - wear.pile}%`

  const faultCard = $('#faultDetailsCard')
  if (faultCard) {
    if (unit.status === 'fault') {
      faultCard.classList.remove('hidden')
      const details = faultDetails[unit.id] || { code: 'FLT-999', desc: 'General system fault. Diagnostics recommended.', time: '5 minutes ago' }
      $('#faultCode').textContent = details.code
      $('#faultDesc').textContent = details.desc
      $('#faultTime').textContent = details.time
    } else {
      faultCard.classList.add('hidden')
    }
  }

  updateMaintenanceDetails()
}

function renderTrackers() {
  $('#wearBlade').style.width = `${wear.blade}%`
  $('#wearGear').style.width = `${wear.gearbox}%`
  $('#wearBearing').style.width = `${wear.bearing}%`
  $('#wearPile').style.width = `${wear.pile}%`
}

function selectTurbine(id) {
  selectedTurbine = id
  fleet.forEach(unit => {
    if (unit.id === id) {
      unit.status = unit.status === 'fault' ? 'fault' : 'online'
      unit.health = Math.max(65, Math.min(95, unit.health + (Math.random() - 0.4) * 4))
    }
  })
  renderFleet()
  updateSelectedInfo()
  showToast('Context switched', `Active unit set to ${id}`)
}

function drawPowerChart(values) {
  const c = $('#powerChart')
  const ctx = c.getContext('2d')
  const w = c.width = c.clientWidth
  const h = c.height = 140
  ctx.clearRect(0, 0, w, h)
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, 'rgba(53,183,255,0.8)')
  gradient.addColorStop(1, 'rgba(45,213,133,0.1)')
  ctx.fillStyle = gradient
  if (!values || !values.length) values = Array.from({ length: 24 }, (_, i) => Math.floor(1200 + 600 * Math.sin(i / 3) + Math.random() * 180))
  const max = Math.max(...values)
  const step = w / (values.length - 1)
  ctx.beginPath()
  values.forEach((v, i) => {
    const x = i * step
    const y = h - (v / max) * (h - 24)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#7dd9ff'
  ctx.lineWidth = 2
  ctx.beginPath()
  values.forEach((v, i) => {
    const x = i * step
    const y = h - (v / max) * (h - 24)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
}

function showToast(title, message) {
  const container = $('#toastContainer')
  if (!container) return
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.innerHTML = `<div><strong>${title}</strong><p>${message}</p></div>`
  container.appendChild(toast)
  setTimeout(() => toast.remove(), 5200)
}

function setupCallouts() {
  $$('.callout').forEach(el => {
    el.addEventListener('click', () => showDetailModal(el.dataset.target))
  })
}

function showDetailModal(key) {
  const detail = calloutDetails[key]
  if (!detail) return
  $('#modalTitle').textContent = detail.title
  $('#modalBody').innerHTML = `<p>${detail.message}</p>`
  $('#detailsModal').classList.remove('hidden')
}

function openMaintenance() {
  $('#maintenanceModal').classList.remove('hidden')
}

function closeModals() {
  $('#detailsModal').classList.add('hidden')
  $('#maintenanceModal').classList.add('hidden')
}

function dispatchWorkOrder() {
  const dispatchDate = $('#maintDispatchDate').value
  const dispatchTime = $('#maintDispatchTime').value
  closeModals()
  if (dispatchDate && dispatchTime) {
    showToast('Dispatch Scheduled', `Work order dispatched for ${selectedTurbine} on ${dispatchDate} at ${dispatchTime}.`)
  } else {
    showToast('Dispatch initiated', 'Technician task order sent to offshore crew for immediate deployment.')
  }
}

function toggleEmergency() {
  emergencyActive = !emergencyActive
  showToast(
    emergencyActive ? 'Emergency stop engaged' : 'Blades resumed',
    emergencyActive ? 'Turbine rotation paused — drivetrain decelerating' : 'Normal operation restored'
  )
}

function toggleVR() {
  vrEnabled = !vrEnabled
  $('#vrMode').textContent = vrEnabled ? 'ON' : 'OFF'
  showToast('VR mode toggled', `Stereoscopic split-screen ${vrEnabled ? 'active' : 'inactive'}`)
}

function setupTabs() {
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      showToast('View changed', `${tab.textContent} display activated`)
      if (tab.dataset.view) changeViewMode(tab.dataset.view)
    })
  })
}

function setupPointerParallax() {
  const viewport = $('#viewportShell')
  if (!viewport) return
  viewport.addEventListener('mousemove', event => {
    const rect = viewport.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    $('#hudCoords').textContent = `${(51.30 + (x - 0.5) * 0.14).toFixed(4)}°N, ${(4.85 + (y - 0.5) * 0.12).toFixed(4)}°E`
  })
}

async function handleLogin(event) {
  event.preventDefault()
  const form = event.target
  const email = form.email.value.trim()
  const password = form.password.value.trim()
  try {
    const response = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    let data
    try { data = await response.json() } catch (e) { data = { message: 'Invalid server response' } }
    if (!response.ok) return showToast('Login error', data.message || 'Login failed')
    setAuth(data.user, data.token)
    showToast('Welcome back', `Logged in as ${data.user.name}`)
  } catch (err) {
    console.error(err)
    showToast('Login error', err.message || 'Connection to authentication server failed')
  }
}

async function handleRegister(event) {
  event.preventDefault()
  const form = event.target
  const name = form.name.value.trim()
  const email = form.email.value.trim()
  const password = form.password.value.trim()
  try {
    const response = await apiFetch('/api/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    let result
    try { result = await response.json() } catch (e) { result = { message: 'Invalid server response' } }
    if (!response.ok) return showToast('Registration failed', result.message || 'Unable to submit request')
    showToast('Requested access', result.message)
    showLogin()
  } catch (err) {
    console.error(err)
    showToast('Registration failed', err.message || 'Connection to authentication server failed')
  }
}

function showLogin() {
  $('#loginForm').classList.add('active')
  $('#registerForm').classList.remove('active')
  $('#registerForm').classList.add('hidden')
  $('#loginForm').classList.remove('hidden')
}

function showRegister() {
  $('#registerForm').classList.add('active')
  $('#loginForm').classList.remove('active')
  $('#loginForm').classList.add('hidden')
  $('#registerForm').classList.remove('hidden')
}

function attachAuthHandlers() {
  $('#loginForm').addEventListener('submit', handleLogin)
  $('#registerForm').addEventListener('submit', handleRegister)
  $('#showRegister').addEventListener('click', event => {
    event.preventDefault()
    showRegister()
  })
  $('#showLogin').addEventListener('click', event => {
    event.preventDefault()
    showLogin()
  })
}

function init() {
  attachAuthHandlers()
  renderApp()
  setupTabs()
  setupPointerParallax()
  $('#btnMaintenance').addEventListener('click', openMaintenance)
  $('#btnEmergency').addEventListener('click', toggleEmergency)
  $('#toggleVR').addEventListener('click', toggleVR)
  $('#closeDetails').addEventListener('click', closeModals)
  $('#closeMaintenance').addEventListener('click', closeModals)
  $('#dispatchWork').addEventListener('click', dispatchWorkOrder)
  if (currentUser && token) {
    connectSocket()
    fetchAppState()
  }
}

async function fetchMaintenanceRecords() {
  try {
    const response = await apiFetch('/api/maintenance')
    if (response.ok) {
      maintenanceRecords = await response.json()
    }
  } catch (err) {
    console.warn("Failed to fetch maintenance from server, using fallback records", err)
  }
  updateMaintenanceDetails()
}

function updateMaintenanceDetails() {
  if (!document.getElementById('maintLastService')) return
  const record = maintenanceRecords.find(r => r.turbine === selectedTurbine || r.turbine === `T-${selectedTurbine.split('-')[1]}`)
  if (record) {
    $('#maintLastService').textContent = record.date || 'N/A'
    $('#maintNextService').textContent = record.nextDate || '2026-07-22'
    $('#maintTech').textContent = record.tech || 'Unassigned'
    $('#maintDesc').textContent = record.service || 'None'
  } else {
    const num = parseInt(selectedTurbine.split('-')[1]) || 1
    const lastDate = `2026-05-${String(10 + num).padStart(2, '0')}`
    const nextDate = `2026-07-${String(15 + num).padStart(2, '0')}`
    $('#maintLastService').textContent = lastDate
    $('#maintNextService').textContent = nextDate
    $('#maintTech').textContent = ['A. Silva', 'B. Khan', 'C. Mei', 'D. Lucas'][num % 4]
    $('#maintDesc').textContent = ['Blade inspection', 'Gearbox lubrication', 'Electrical alignment', 'Vibration scan'][num % 4]
  }
}

function updateLiveCounters(rotorSpeed, powerKw) {
  const rpm = rotorSpeed * 1000
  totalRevolutions += (rpm / 60)
  totalEnergy += (powerKw / 3600000)
  const revsEl = $('#countRevolutions')
  const energyEl = $('#countEnergy')
  if (revsEl) revsEl.textContent = Math.round(totalRevolutions).toLocaleString()
  if (energyEl) energyEl.textContent = totalEnergy.toFixed(4)
}

document.addEventListener('DOMContentLoaded', init)
