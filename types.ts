export type RoomState = {
    name: string
    uid: string
    clients: number
    clientLimit: number
    protected: boolean //room will not be destroyed even with 0 clients
    //ttl: number <- specified amount when will the room will be automatically deleted except when the room is protected
} & (SecureRoomState | PublicRoomState)

type SecureRoomState = {
    password?: string | boolean
    /*
    hidden: boolean
    inviteOnly: boolean*/
}
type PublicRoomState = {
    password: false
}
export type UserState = {
    username: string
    uid: string
    roomUid: string
}
export type ChatMessage = {
    senderId: string
    username: string
    message: string
}
