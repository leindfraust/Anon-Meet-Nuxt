import type { RoomState } from 'types'

export const useRoomStoreState = defineStore('roomState', {
    state: () => ({
        room: [] as RoomState[]
    }),
})