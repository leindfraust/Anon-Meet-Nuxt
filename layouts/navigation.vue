<script setup lang="ts">
import { RoomState } from 'types';
import { useUserStoreState } from '@/stores/userState';

const userStateStore = useUserStoreState()
const socket = useSocket()
const roomState = ref<RoomState[]>([] as RoomState[])

const roomUidProtected = ref('')

onMounted(() => {
    socket.on('room update', (roomUpdate: RoomState[]) => {
        roomState.value = [...roomUpdate]
    })
})
function joinRoom(room: RoomState) {
    if (room.clients < room.clientLimit) {
        if (room.password) {
            roomUidProtected.value = room.uid
            const roomAuth = document.getElementById('roomAuth') as HTMLDialogElement
            roomAuth.showModal()
        } else {
            socket.emit('leave room', userStateStore.user.roomUid, userStateStore.user)
            userStateStore.user.roomUid = room.uid // update socket id connection
            socket.emit('join room', userStateStore.user.roomUid, userStateStore.user)
        }
    }
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
                    <li v-for="room in roomState" :key="room.uid">
                        <a class="flow-root text-xl" @click="joinRoom(room)">
                            <span class="float-left">
                                <div class="badge" v-if="room.protected"><font-awesome-icon icon="shield" /></div>
                                <div class="badge" v-if="room.password"><font-awesome-icon icon="lock" /></div> {{ room.name
                                    ===
                                    'Default' ? 'Hangout' : room.name }}
                            </span>
                            <span class="float-right"><font-awesome-icon icon="fa-solid fa-user" /> {{ room.clients
                            }}/{{ room.clientLimit }}</span>
                        </a>
                    </li>
                    <br />
                    <li>
                        <button class="btn btn-primary" onclick="roomCreate.showModal()"><span
                                class="text-lg">CREATE</span></button>
                    </li>
                    <div class="fixed bottom-0 p-6">
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="w-12 rounded">
                                    <img :src="`https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=${userStateStore.user.uid}`"
                                        width="54" />
                                </div>
                            </div>
                            <span class="lg:text-2xl text-4xl font-bold"> {{ userStateStore.user.username }}
                            </span>
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