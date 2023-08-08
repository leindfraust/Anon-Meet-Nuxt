<script setup lang="ts">
import { useUserStoreState } from '@/stores/userState'
import { useRoomStoreState } from '@/stores/roomState';
import { ChatMessage } from 'types';
definePageMeta({
    middleware: [
        (() => {
            const userStateStore = useUserStoreState()
            if (Object.keys(userStateStore.user).length === 0) {
                return navigateTo('/')
            }
        })
    ],
    layout: 'navigation'
})

const route = useRoute()
const router = useRouter()
const roomStateStore = useRoomStoreState()
const userStateStore = useUserStoreState()
const socket = useSocket()

const chatMessages = ref<ChatMessage[]>([] as ChatMessage[])
const inputMessage = ref('')

function autoScrollChatContainer() {
    setTimeout(() => {
        const chatContainer = document.getElementById("chat-container") as HTMLElement
        chatContainer.scrollTop = chatContainer.scrollHeight
    }, 100)
}

onMounted(() => {
    //reconnect user
    if (Object.keys(roomStateStore.room).length === 0) {
        socket.emit('join room', route.params.uid, userStateStore.user)
    }

    socket.on('force disconnect', () => {
        router.push('/')
    })

    socket.on('global message', (msg, userId) => {
        if (userId === userStateStore.user.uid) {
            chatMessages.value = []
        }
        chatMessages.value.push({
            senderId: 'system',
            username: 'system',
            message: msg
        })
        autoScrollChatContainer()
    })
    socket.on('chat message', (userDetails, msg) => {
        chatMessages.value.push({
            senderId: userDetails.uid,
            username: userDetails.username,
            message: msg
        })
        autoScrollChatContainer()
    })
})

function sendMessage() {
    if (inputMessage.value !== '') {
        socket.emit('message', route.params.uid, userStateStore.user, inputMessage.value)
        inputMessage.value = ''
    }
}

</script>
<template>
    <div class="basis-full">
        <div class="lg:max-h-[85vh] max-h-[70vh] overflow-auto p-6" id="chat-container">
            <span v-for="message in chatMessages" :key="message.senderId">
                <div class="flex justify-center text-xl font-bold px-4 py-3 rounded-md" role="alert"
                    v-if="message.senderId === 'system'">
                    <p>{{ message.message }}</p>
                </div>
                <div class="chat chat-start"
                    v-if="message.senderId !== userStateStore.user.uid && message.senderId !== 'system'">
                    <div class="chat-image avatar">
                        <div class="w-14 rounded-full">
                            <img :src="`https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=${message.senderId}`" />
                        </div>
                    </div>
                    <div class="chat-header">
                        {{ message.username }}
                    </div>
                    <div class="chat-bubble text-lg">{{ message.message }}</div>
                </div>
                <div class="chat chat-end" v-else-if="message.senderId !== 'system'">
                    <div class="chat-bubble text-lg">{{ message.message }}</div>
                </div>
            </span>
        </div>
        <div class="flex items-center justify-center">
            <div class="fixed bottom-0 p-12 lg:w-9/12">
                <div class="flex items-center justify-center space-x-4">
                    <!-- <textarea class="textarea textarea-bordered textarea-lg join-item w-11/12" placeholder="Type here..."
                        v-model="inputMessage" @keyup.enter="sendMessage"></textarea> -->
                    <input type="text" placeholder="Type here..." class="input input-lg join-item lg:w-screen xs:w-screen"
                        v-model="inputMessage" @keyup.enter="sendMessage" />
                    <font-awesome-icon icon="paper-plane" size="2xl" class=" cursor-pointer" @click="sendMessage" />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
::-webkit-scrollbar {
    display: none;
}
</style>