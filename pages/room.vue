<script setup lang="ts">
import { useUserStoreState } from '@/stores/userState'
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

const userStateStore = useUserStoreState()
const socket = useSocket()

const chatMessages = ref<ChatMessage[]>([] as ChatMessage[])
const inputMessage = ref('')

onBeforeMount(() => {
    socket.emit('join room', userStateStore.user.roomUid, userStateStore.user)

})

function autoScrollChatContainer() {
    setTimeout(() => {
        const chatContainer = document.getElementById("chat-container") as HTMLElement
        chatContainer.scrollTop = chatContainer.scrollHeight
    }, 100)
}

onMounted(() => {
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

    window.addEventListener("beforeunload", function (event) {
        socket.emit('leave room', userStateStore.user.roomUid, userStateStore.user)
        socket.disconnect()
    });
})
onBeforeUnmount(() => {
    socket.emit('leave room', userStateStore.user.roomUid, userStateStore.user)
    socket.disconnect()
})

function sendMessage() {
    if (inputMessage.value !== '') {
        socket.emit('message', userStateStore.user.roomUid, userStateStore.user, inputMessage.value)
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
                    <div class="chat-image avatar">
                        <div class="w-14 rounded-full">
                            <img :src="`https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=${message.senderId}`" />
                        </div>
                    </div>
                    <div class="chat-header">
                        {{ message.username }}(You)
                    </div>
                    <div class="chat-bubble text-lg">{{ message.message }}</div>
                </div>
            </span>
        </div>
        <div class="flex items-center justify-center">
            <div class="fixed bottom-0 p-12 w-9/12">
                <div class="join flex items-center justify-center">
                    <input class="input input-bordered join-item lg:w-11/12 md:w-full" placeholder="Type here..."
                        v-model="inputMessage" @keyup.enter="sendMessage" />
                    <button class="btn join-item rounded-r-full" @click="sendMessage"
                        :disabled="inputMessage == ''">Send</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    background-color: #000;
}

::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-color: #777;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #999;
}
</style>