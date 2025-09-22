import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
    }),
    AutoImport({
      resolvers: [IconsResolver({ prefix: 'i' })],
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ['material-symbols', 'fa6-brands'],
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@#': fileURLToPath(new URL('./src/assets/mc_lang/valid', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return

          if (id.includes('node_modules')) {
            return 'vendor'
          }

          const mcLangPosix = '/src/assets/mc_lang/valid/'
          const mcLangWin = '\\src\\assets\\mc_lang\\valid\\'
          if (id.includes(mcLangPosix) || id.includes(mcLangWin)) {
            const parts = id.split(/[/\\\\]/)
            const file = parts[parts.length - 1]
            const name = file.replace(/\.json$/, '')
            return `mc_lang_${name}`
          }
        },
      },
    },
  },
})
