<script setup lang="ts">
import { useUserStoreState } from '@/stores/userState';

const socket = useSocket()
const password = ref('')
const wrongPassword = ref(false)
const userStateStore = useUserStoreState()
const roomUid = defineModel<string>()
onMounted(() => {
    socket.on('correct password', () => {
        wrongPassword.value = false
        socket.emit('leave room', userStateStore.user.roomUid, userStateStore.user)
        userStateStore.user.roomUid = roomUid.value as unknown as string // update socket id connection
        roomUid.value = ''
        const roomAuth = document.getElementById('roomAuth') as HTMLDialogElement
        roomAuth.close()
    })
    socket.on('wrong password', () => {
        wrongPassword.value = true
    })
})
function authenticateRoom() {
    if (password.value) {
        socket.emit('join room', roomUid.value, userStateStore.user, password.value)
    }
}
</script>
<template>
    <dialog id="roomAuth" class="modal justify-center items-center content-center">
        <div class="container modal-box p-16 overflow-hidden">
            <form method="dialog" id="roomAuthForm">
                <h1 class="text-3xl font-bold w-screen">Enter password</h1>
                <br />
                <div class="form-control w-full max-w-xs space-y-4 m-auto ">
                    <input type="text" placeholder="Room Name" class="input input-bordered w-full max-w-xs"
                        v-model="password" required />
                </div>
                <br />
                <div v-if="wrongPassword">
                    <div class="flex items-center bg-red-500 text-white text-xs font-bold px-4 py-3 rounded-md"
                        role="alert">
                        <p>Incorrect password.</p>
                    </div>
                    <br />
                </div>
            </form>
            <div class="flex justify-center space-x-2">
                <button class="btn btn-primary" @click="authenticateRoom" :disabled="!password">Confirm</button>
                <button class="btn" onclick="roomAuth.close()"
                    @click="password = '', wrongPassword = false, roomUid = ''">Close</button>
            </div>
        </div>
    </dialog>
</template>