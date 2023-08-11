// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      gtagId: process.env.GOOGLE_ANALYTICS_ID
    }
  },
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
  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', 'nuxt3-socket.io', 'nuxt-security'],
  security: {
    nonce: true,
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", "data:", "https://www.dicebear.com/", "https://api.dicebear.com/"],
        'script-src-attr': ["'unsafe-inline'"] //cannot use nonce at the moment as it is returning an error
      },
      crossOriginEmbedderPolicy: 'unsafe-none'
    }
  },
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
