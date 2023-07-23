import type { UserState } from 'types'

import {defineStore} from 'pinia'
export const useUserStoreState = defineStore('userState', {
    state: () => ({
        user: {} as UserState
    })
})