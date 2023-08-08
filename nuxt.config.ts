// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Anon Meet - chat anyone, anonymously',
      meta: [
        {
          name: 'description', content: 'Anon Meet is a privacy-focused web chat application that prioritizes anonymity. Built on socket.io, it operates without a database, ensuring zero tracking or sharing of user data. Emphasizing user privacy, it offers a secure platform for seamless, anonymous communication.'
        },
        {
          name: 'author', content: 'leindfraust'
        },
        {
          name: 'keywords', content: 'chat, anonymous, anon meet, chat anonymous'
        }
      ]
    }
  },
  components: [
    {
      path: '~/components',
      extensions: ['.vue']
    }
  ],
  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', 'nuxt3-socket.io',],
  socket: {
    serverOptions: {}
  },
  pinia: {
    autoImports: [
      // automatically imports `defineStore`
      'defineStore', // import { defineStore } from 'pinia'
      ['defineStore', 'definePiniaStore'], // import { defineStore as definePiniaStore } from 'pinia'
    ],
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }
  }
})
