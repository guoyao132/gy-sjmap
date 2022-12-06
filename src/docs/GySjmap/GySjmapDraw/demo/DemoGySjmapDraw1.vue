<template>
  <SjmapCon>
    <GySjmapDraw
      @drawFinish="drawFinish"
    ></GySjmapDraw>

  </SjmapCon>
</template>

<script setup lang="ts">
import SjmapCon from '@/components/SjmapCon.vue';
const drawFinish = (data: any) => {
  console.log(data);
}
</script>
