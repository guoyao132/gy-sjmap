<template>
  <SjmapCon>
    <GySjmapText
      :position="p"
      text="aaaaaAAAAA"
    />
  </SjmapCon>
</template>

<script setup lang="ts">
import SjmapCon from '@/components/SjmapCon.vue'
import {ref} from "vue"
const p = ref([116.40803281576643,39.893935171491535]);
setTimeout(() => {
  console.log('123')
  p.value = [116.40803281576643,39.903935171491535];
}, 3000)
</script>
