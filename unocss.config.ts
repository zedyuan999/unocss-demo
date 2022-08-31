import {
  defineConfig,
  presetUno
} from 'unocss'
import transformerDirective from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  transformers: [
    transformerDirective(),
  ],
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-between': 'flex justify-between items-center'
  },
  theme: {
    breakpoints: {
      // => @media (min-width: 640px) { ... }
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  }
})