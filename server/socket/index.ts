import type { ChatMessage, RoomState, UserState, UserTTL } from '../../types'
import { defineIOHandler } from 'nuxt3-socket.io'


let roomState = [{
    name: 'Default',
    uid: '1a',
    clientLimit: 100,
    clients: [],
    protected: true,
    password: false
}] as RoomState[] //this will populate 

let connectedUsers: string[] = []

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
    const room = JSON.parse(JSON.stringify(roomState)) //deep copy
    room.forEach((room: RoomState) => {
        room.password ? room.password = true : room.password = false
    })
    return room
}

let user_ttl: UserTTL[] = []

export default defineIOHandler((io) => {

    io.use((socket, next) => {
        const userUid = socket.handshake.auth.uid
        if (userUid) {
            const session = connectedUsers.find(uid => uid === userUid)
            if (session) {
                socket.data.uid = userUid
                return next()
            } else {
                socket.data.uid = userUid
                connectedUsers.push(userUid)
                return next()
            }
        }
        socket.data.uid = uuidCreation()
        connectedUsers.push(socket.data.uid)
        next()
    }).on('connection', async (socket) => {
        socket.conn.once("upgrade", () => console.log('Transport upgraded to', socket.conn.transport.name))
        let timeout: NodeJS.Timeout;
        let countdown: number = 900000 //15minutes

        async function autoUserTTL(uid: string) {
            const userTTL = user_ttl.find(user => user.uid === uid)
            if (!userTTL || typeof userTTL === undefined) {
                user_ttl.push({
                    uid: uid,
                    ttl: () => {
                        roomState.forEach(room => {
                            room.clients = [...room.clients.filter(client => client !== uid)]
                        })
                        connectedUsers = [...connectedUsers.filter(user => user !== uid)]
                        io.to(socket.id).emit('force disconnect')
                        io.emit('room update', roomUpdateResponse())
                        user_ttl = [...user_ttl.filter(user => user.uid !== uid)]
                    }
                })
                const newUserTTL = user_ttl.find(user => user.uid === uid) as UserTTL
                timeout = setTimeout(() => newUserTTL.ttl(), countdown)
            } else {
                const newUserTTL = user_ttl.find(user => user.uid === uid) as UserTTL
                clearTimeout(timeout)
                timeout = setTimeout(() => newUserTTL.ttl(), countdown)
            }
        }

        socket.emit('session', {
            uid: socket.data.uid
        })

        socket.on('disconnect', () => {
            const userUid = socket.handshake.auth.uid
            connectedUsers = connectedUsers.filter(user => user !== userUid)
        })

        socket.on('join room', (roomUid, socketDetails: UserState, password) => {
            if (roomState.find(room => room.uid === roomUid)) {
                const roomIndex = roomState.findIndex(room => room.uid === roomUid)
                if (roomState[roomIndex].password) {
                    if (roomState[roomIndex].password === password) {
                        if (!roomState[roomIndex].clients.find(uid => uid === socketDetails.uid)) {
                            roomState[roomIndex].clients.push(socketDetails.uid)
                        }
                        autoUserTTL(socketDetails.uid)
                        socket.join(roomUid)
                        io.to(socket.id).emit('correct password')
                        io.in(roomUid).emit('global message', joinMsg(socketDetails.username), socketDetails.uid);
                        io.emit('room update', roomUpdateResponse())
                    } else {
                        io.to(socket.id).emit('wrong password')
                    }
                } else {
                    if (!roomState[roomIndex].clients.find(uid => uid === socketDetails.uid)) {
                        roomState[roomIndex].clients.push(socketDetails.uid)
                    }
                    autoUserTTL(socketDetails.uid)
                    socket.join(roomUid)
                    io.in(roomUid).emit('global message', joinMsg(socketDetails.username), socketDetails.uid);
                    io.emit('room update', roomUpdateResponse())
                }
            }
        })

        socket.on('leave room', (roomUid, socketDetails: UserState, partialLeave: boolean, reconnLeave: boolean) => {
            if (!partialLeave) {
                if (roomState.find(room => room.uid === roomUid)) {
                    roomState.forEach(room => {
                        room.clients = [...room.clients.filter(uid => uid !== socketDetails.uid)]
                    })
                }
            } else {
                const roomIndex = roomState.findIndex(room => room.uid === roomUid)
                if (!reconnLeave) {
                    roomState[roomIndex].clients = roomState[roomIndex].clients.filter(uid => uid !== socketDetails.uid)
                } else {
                    if (roomState.find(room => room.uid === roomUid)) {
                        roomState.forEach(room => {
                            room.clients = [...room.clients.filter(uid => uid !== socketDetails.uid)]
                        })
                        roomState[roomIndex].clients.push(socketDetails.uid)
                    }
                }
            }
            if (!reconnLeave) {
                socket.leave(roomUid)
                io.in(roomUid).emit('global message', leaveMsg(socketDetails.username));
            } else {
                autoUserTTL(socketDetails.uid)
            }
            io.emit('room update', roomUpdateResponse())
        })

        socket.on('room create', (roomDetails: RoomState, uid: string) => {
            if (!roomState.find(room => room.name === roomDetails.name)) {
                const uuid = uuidCreation()
                roomState.push({
                    name: roomDetails.name,
                    uid: uuid,
                    password: roomDetails.password == '' ? false : roomDetails.password,
                    protected: roomDetails.protected,
                    clientLimit: roomDetails.clientLimit,
                    clients: []
                })
                autoUserTTL(uid)
                io.to(socket.id).emit('redirect room created', uuid)
                io.emit('room update', roomUpdateResponse())
            }
        })

        socket.on('message', async (roomUid, socketDetails: UserState, message: ChatMessage) => {
            autoUserTTL(socketDetails.uid)
            io.in(roomUid).emit('chat message', socketDetails, message);
        });
    })
})