import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/, /\.vue\?vue/, // .vue
      ],
      imports: ['vue', 'vue-router'],
      dts: true
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      resolvers: [
        ElementPlusResolver(),
      ],
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/],
      directoryAsNamespace: true,
      dts: 'components.d.ts',
    }),
    ElementPlus({}),
    Unocss({
      mode: 'vue-scoped'
    }),
  ]
})
