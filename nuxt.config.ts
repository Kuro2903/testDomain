// https://nuxt.com/docs/api/configuration/nuxt-config
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 4000
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxtjs-naive-ui',
    "dayjs-nuxt",
    [
      "@pinia/nuxt",
      {
        autoImports: [
          // automatically imports `usePinia()`
          "defineStore",
          // automatically imports `usePinia()` as `usePiniaStore()`
          ["defineStore", "definePiniaStore"],
        ],
      },
    ],
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    public: {
      baseUrl: "",
      wsUrl: "",
      OauthServerUrl: "",
      OauthClientId: "",
      OauthOrganizationName: "",
      OauthAppName: "",
      DomainExam: "",
      DomainName: "",
      VideoProvider: "",
      streamingAdaptiveUrl: "",
      streamingMp4Url: "",
      streamingProvider: "",
      TimeoutVideo: "",
    },
  },
  css: ["@/assets/index.css"],
  vite: {
    plugins: [
      AutoImport({
        imports: [
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          }
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ],
  },
  dayjs: {
    defaultLocale: ['en', {
      weekStart: 1
    }]
  },
})