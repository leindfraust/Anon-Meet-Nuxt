import type { UserState } from 'types'

export const useUserStoreState = defineStore('userState', {
    state: () => ({
        user: {} as UserState
    }),
    persist: true
})