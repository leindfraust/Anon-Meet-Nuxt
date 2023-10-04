<script setup lang="ts">
import type { RoomState } from 'types';
import { useUserStoreState } from '@/stores/userState';
import { useRoomStoreState } from '@/stores/roomState';
import { ref } from 'vue'

definePageMeta({ layout: 'footer' })

const socket = useSocket()
const router = useRouter()
const username = ref('')
const userStateStore = useUserStoreState()

async function joinDefaultRoom() {
    if (username.value) {
        userStateStore.$patch({
            user: {
                username: username.value,
                roomUid: '1a',
            }
        })
        const user = username.value
        socket.auth = { user }
        socket.emit('join room', '1a', userStateStore.user)
        await router.push('/room/1a')
    }
}

onMounted(() => {
    if (!userStateStore.user.uid) {
        socket.emit('leave room', userStateStore.user.roomUid, userStateStore.user)
        userStateStore.$reset()
    }
})
</script>
<template>
    <div class="hero min-h-screen bg-base-200">
        <div class="hero-content text-center">
            <div class="max-w-md space-y-6">
                <div class="flex items-center">
                    <img src="/img/anon-meet-logo.svg" width="112" />
                    <span class="lg:text-6xl text-4xl font-bold">non Meet
                    </span>
                </div>
                <p class="text-lg">Chat <span class="font-bold">anyone</span>, <span class="font-bold">anonymously</span>.
                </p>
                <div class="join">
                    <input class="input input-bordered join-item" placeholder="Enter username" v-model="username" />
                    <button class="btn btn-primary join-item rounded-r-full" @click="joinDefaultRoom"
                        :disabled="username == ''">JOIN NOW</button>
                </div>
            </div>
        </div>
    </div>
</template>