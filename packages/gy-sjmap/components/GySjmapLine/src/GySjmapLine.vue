<template></template>
<script lang="ts">
import {defineComponent, onMounted, onBeforeUnmount, getCurrentInstance} from 'vue-demi'
import type {defineComponent as defineComponentOption} from 'vue-demi'
import CreateLineLayer ,{layerProps} from "../../../hooks/createLayer/CreateLineLayer";
import CreateTextLayer from "../../../hooks/createLayer/CreateTextLayer";
export default defineComponent({
  name: 'GySjmapLine',
  props: {
    ...layerProps,
  },
  setup(props){
    const {proxy} = getCurrentInstance();
    const mapId:string = proxy.$parent.id;
    let layerObj:CreateLineLayer = null;
    let layerTextObj:CreateTextLayer = null;
    onMounted(() => {
      layerObj = new CreateLineLayer(mapId, props);
      if(props.text){
        layerTextObj = new CreateTextLayer(mapId, {
          layout: props.layout,
          textSize: props.layout['text-size'] || 50,
          ...props.paint,
          text: props.text,
          position: props.positionList,
        }, 'LineString');
      }
      const runTask = proxy.$parent.runTask;
      if(runTask){
        runTask(layerObj, props)
      }
    })
    const destory = () => {
      layerObj.destory();
      layerObj = null;
    }
    onBeforeUnmount(() => {
      destory();
      const destoryTask = proxy.$parent.destory;
      if(destoryTask){
        destoryTask()
      }
    })
  }
} as defineComponentOption)
</script>
