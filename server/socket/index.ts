import type { ChatMessage, RoomState, UserState } from '../../types'
import { defineIOHandler } from 'nuxt3-socket.io'


let roomState = [{
    name: 'Default',
    uid: '1a',
    clientLimit: 100,
    clients: 0,
    protected: true,
    password: ''
}] as RoomState[] //this will populate 

function joinMsg(name: string) {
    return `${name} has joined the room.`
}
function leaveMsg(name: string) {
    return `${name} has left the room.`
}
function uuidCreation() {
    return Math.floor(Math.random() * Date.now()).toString(16)
}
function roomUpdateResponse() {
    const room = [...roomState]
    room.forEach(room => {
        room.password ? room.password : room.password = false
    })
    return room
}
export default defineIOHandler((io) => {
    io.on('connection', async (socket) => {
        console.log('connected', socket.id)
        socket.on('join room', (roomUid, socketDetails: UserState, password) => {
            if (roomState.find(room => room.uid === roomUid)) {
                if (password) {
                    const roomIndex = roomState.findIndex(room => room.uid === roomUid)
                    if (roomState[roomIndex].password === password) {
                        roomState[roomIndex].clients += 1
                        socket.join(roomUid)
                        io.to(socketDetails.uid).emit('correct password')
                        io.to(roomUid).emit('global message', joinMsg(socketDetails.username), socketDetails.uid);
                        io.emit('room update', roomUpdateResponse())
                        console.log(roomUpdateResponse())
                    } else {
                        io.to(socketDetails.uid).emit('wrong password')
                    }
                } else {
                    const roomIndex = roomState.findIndex(room => room.uid === roomUid)
                    roomState[roomIndex].clients += 1
                    socket.join(roomUid)
                    io.to(roomUid).emit('global message', joinMsg(socketDetails.username), socketDetails.uid);
                    io.emit('room update', roomUpdateResponse())
                    console.log(roomUpdateResponse())
                }
            }
        })
        socket.on('leave room', (roomUid, socketDetails: UserState) => {
            if (roomState.find(room => room.uid === roomUid)) {
                const roomIndex = roomState.findIndex(room => room.uid === roomUid)
                roomState[roomIndex].clients -= 1
                socket.leave(roomUid)
                io.to(roomUid).emit('global message', leaveMsg(socketDetails.username));
                io.emit('room update', roomUpdateResponse())
                console.log(roomUpdateResponse())
            }
        })
        socket.on('room create', (roomDetails: RoomState, socketId: string) => {
            if (!roomState.find(room => room.name === roomDetails.name)) {
                const uuid = uuidCreation()
                roomState.push({
                    name: roomDetails.name,
                    uid: uuid,
                    password: roomDetails.password == '' ? false : roomDetails.password,
                    protected: roomDetails.protected,
                    clientLimit: roomDetails.clientLimit,
                    clients: 0
                })
                io.to(socketId).emit('redirect room created', uuid)
                io.emit('room update', roomUpdateResponse())
                console.log(roomUpdateResponse())
            }
        })
        socket.on('message', async (roomUid, socketDetails: UserState, message: ChatMessage) => {
            io.to(roomUid).emit('chat message', socketDetails, message);
        });
    })
})