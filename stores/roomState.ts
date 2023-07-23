import type { RoomState } from 'types'

import { defineStore } from 'pinia'
export const useRoomStoreState = defineStore('roomState', {
    state: () => ({
        room: [] as RoomState[]
    })
})