import { Server } from 'socket.io'
import { registerHandlers } from './handlers'

export function socketServer(io: Server) {
  io.on('connection', socket => {
    registerHandlers(socket, io)
  })
}
