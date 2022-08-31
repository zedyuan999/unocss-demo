

<template>
  <h1>{{ msg }}</h1>
  <Tinymce></Tinymce>
</template>

<script setup lang="ts">
import Tinymce from './Tinymce/index.vue'

defineProps({
  msg: String
})
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
