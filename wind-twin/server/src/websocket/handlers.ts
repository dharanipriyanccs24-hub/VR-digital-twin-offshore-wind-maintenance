import { Socket } from 'socket.io'

export function registerHandlers(socket: Socket, io: Socket['server']) {
  socket.on('join:turbine', payload => {
    socket.join(payload.turbineId)
    socket.emit('command:ack', { commandId: '', status: 'OK', message: `Joined ${payload.turbineId}` })
  })

  socket.on('join:user', payload => {
    const room = `user:${payload.userId}`
    socket.join(room)
    socket.emit('command:ack', { commandId: '', status: 'OK', message: `Joined user room ${payload.userId}` })
  })

  socket.on('leave:turbine', payload => {
    socket.leave(payload.turbineId)
    socket.emit('command:ack', { commandId: '', status: 'OK', message: `Left ${payload.turbineId}` })
  })

  socket.on('command', payload => {
    socket.emit('command:ack', { commandId: payload.commandId, status: 'OK', message: 'Command received' })
  })

  socket.on('ping', payload => {
    socket.emit('pong', { t: payload.t, serverTime: Date.now() })
  })
}
