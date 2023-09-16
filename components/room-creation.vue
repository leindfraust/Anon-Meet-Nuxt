<script setup lang="ts">
import { useUserStoreState } from '@/stores/userState';

const router = useRouter()
const route = useRoute()
const socket = useSocket()
const userStateStore = useUserStoreState()

const name = ref('')
const requiredRoomNameAlert = ref(false)
const clientLimit = ref(10)
const protectedRoom = ref(false) //experimental, should not use for now
const password = ref('')

//const ttl = ref(10000)
//const hidden = ref(false)
//const inviteOnly = ref(false)

onMounted(() => {
    socket.on('redirect room created', async (uid) => {
        socket.emit('leave room', route.params.uid, userStateStore.user)
        userStateStore.user.roomUid = uid // update user room
        if (password.value) {
            socket.emit('join room', uid, userStateStore.user, password.value)
        } else {
            socket.emit('join room', uid, userStateStore.user)
        }
        clearFields()
        await router.push(`/room/${uid}`)
    })
})

function clearFields() {
    name.value = ''
    clientLimit.value = 10
    protectedRoom.value = false
    password.value = ''
}
function createRoom() {
    if (name.value) {
        requiredRoomNameAlert.value = false
        const roomDetails = {
            name: name.value,
            password: password.value,
            protected: protectedRoom.value,
            clientLimit: clientLimit.value
        }
        socket.emit('create room', roomDetails, userStateStore.user.uid)
        const roomCreate = document.getElementById("roomCreate") as HTMLDialogElement
        roomCreate.close()
    } else {
        requiredRoomNameAlert.value = true
    }
}
</script>
<template>
    <dialog id="roomCreate" class="modal justify-center items-center content-center">
        <div class="container modal-box p-16 overflow-hidden">
            <form method="dialog">
                <h1 class="text-3xl font-bold w-screen">Create a Room</h1>
                <br />
                <div class="form-control w-full max-w-xs space-y-4 m-auto ">
                    <input type="text" placeholder="Room Name" class="input input-bordered w-full max-w-xs"
                        v-model="name" />
                    <input type="text" placeholder="Password (Optional)" class="input input-bordered w-full max-w-xs"
                        v-model="password" />
                    <label class="label">Member Limit<div class="badge btn-accent">default: 10</div></label>
                    <input type="number" placeholder="Member limit" min="0" max="100"
                        class="input input-bordered w-full max-w-xs" v-model="clientLimit" />
                </div>
                <br />

            </form>
            <div v-if="requiredRoomNameAlert">
                <div class="flex items-center bg-red-500 text-white text-xs font-bold px-4 py-3 rounded-md" role="alert">
                    <p>Room Name is required.</p>
                </div>
                <br />
            </div>
            <div class="flex justify-center space-x-2">
                <button class="btn btn-primary" @click="createRoom">Confirm</button>
                <button class="btn" onclick="roomCreate.close()"
                    @click="clearFields, requiredRoomNameAlert = false">Close</button>
            </div>

        </div>
    </dialog>
</template>