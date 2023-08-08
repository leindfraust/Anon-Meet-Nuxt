<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang='ts'>
import type { RoomState } from 'types';
import { useUserStoreState } from '@/stores/userState';
import { useRoomStoreState } from '@/stores/roomState';

const socket = useSocket()
const userStateStore = useUserStoreState()
const roomStateStore = useRoomStoreState()
const route = useRoute()

onBeforeMount(() => {
  if (Object.keys(userStateStore.user).length === 0) {
    socket.on('session', ({ uid }) => {
      socket.auth = { uid }
      userStateStore.$patch({
        user: {
          uid: uid
        }
      })
    })
  } else {
    const uid = userStateStore.user.uid
    socket.auth = { uid }
  }
})

onMounted(() => {
  socket.on('room update', (roomUpdate: RoomState[]) => {
    roomStateStore.$patch({
      room: [...roomUpdate]
    })
  })
})

onBeforeUnmount(() => {
  socket.emit('leave room', route.params.uid, userStateStore.user)
  socket.disconnect()
})

</script>