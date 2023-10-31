<script setup lang="ts">
import type { RoomState } from '@/types';
import { useUserStoreState } from '@/stores/userState';
import { useRoomStoreState } from '@/stores/roomState'

const route = useRoute()
const router = useRouter()
const userStateStore = useUserStoreState()
const socket = useSocket()
const roomStateStore = useRoomStoreState()

const roomUidProtected = ref('')

async function joinRoom(room: RoomState) {
    if (room.clients.length < room.clientLimit && room.uid !== route.params.uid) {
        if (room.password) {
            roomUidProtected.value = room.uid
            const roomAuth = document.getElementById('roomAuth') as HTMLDialogElement
            roomAuth.showModal()
        } else {
            socket.emit('leave room', route.params.uid, userStateStore.user)
            userStateStore.user.roomUid = room.uid //update user room
            socket.emit('join room', room.uid, userStateStore.user)
            await router.push(`/room/${room.uid}`)
        }
    }
}

async function leaveRoom() {
    socket.emit('leave room', route.params.uid, userStateStore.user)
    await router.push('/')
}

</script>
<template>
    <label for="rooms-menu" class="block drawer-button lg:hidden p-4 bg-base-200"><font-awesome-icon icon="bars" /></label>
    <div class="flex flex-row">
        <div class="drawer lg:drawer-open z-10 basis-0">
            <input id="rooms-menu" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content max-w-[20rem] overflow-auto">
                <!-- Page content here -->

            </div>
            <div class="drawer-side">
                <label for="rooms-menu" class="drawer-overlay"></label>
                <ul class="menu p-4 w-80 h-full bg-base-200 text-base-content">
                    <!-- Sidebar content here -->
                    <li v-for="room in roomStateStore.room" :key="room.uid">
                        <a class="flow-root text-xl" @click="joinRoom(room)">
                            <span class="float-left">
                                <div class="badge" v-if="room.protected"><font-awesome-icon icon="shield" /></div>
                                <div class="badge" v-if="room.password"><font-awesome-icon icon="lock" /></div> {{ room.name
                                    ===
                                    'Default' ? 'Hangout' : room.name }}
                            </span>
                            <span class="float-right"><font-awesome-icon icon="fa-solid fa-user" /> {{ room.clients.length
                            }}/{{ room.clientLimit }}</span>
                        </a>
                    </li>
                    <br />
                    <li>
                        <button class="btn btn-primary" onclick="roomCreate.showModal()"><span
                                class="text-lg">CREATE</span></button>
                    </li>
                    <div class="fixed bottom-0 p-6">
                        <div
                            class="flex items-center space-x-12 w-64 overflow-hidden hover:overflow-auto focus:overflow-auto">
                            <div class="avatar space-x-3 items-center">
                                <div class="w-12 rounded">
                                    <img :src="`https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=${userStateStore.user.uid}`"
                                        width="54" />
                                </div>
                                <span class="lg:text-2xl text-4xl font-bold"> {{ userStateStore.user.username }}
                                </span>
                            </div>
                            <a><font-awesome-icon icon="right-from-bracket" class=" text-red-500" size="2xl"
                                    @click="leaveRoom" /></a>
                        </div>
                    </div>
                </ul>

            </div>
        </div>
        <slot />
        <RoomCreation />
        <RoomPasswordAuth v-model="roomUidProtected" />
    </div>
</template>
<style scoped>
::-webkit-scrollbar {
    width: 6px;
    border-radius: 4%;
}

::-webkit-scrollbar-track {
    background-color: hsl(var(--b1) / var(--tw-bg-opacity, 1));
}

::-webkit-scrollbar-thumb {
    background-color: #565555;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #555;
}
</style>