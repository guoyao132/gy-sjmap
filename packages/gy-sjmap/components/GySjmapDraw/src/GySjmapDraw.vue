<template>
  <div class="draw-btns-list" v-show="mapFinish" ref="drawCon">
    <div class="draw-start draw-btn" v-show="!status || status === 'end'" @click="startDraw">开始绘制</div>
    <div class="draw-type draw-btn draw-type-select" v-show="status && status !== 'end'">
      绘制类型
      <div class="draw-type-select-con">
        <div v-for="(item, index) in drawTypeList" :key="'type' + index"
             :class="['draw-type-option', {'active': drawType === item}]"
             @click="changeDrawType(item)">
          {{ drawTypeCnameList[index] || '待定' }}
        </div>
      </div>
    </div>
    <div class="draw-end draw-btn" v-show="drawStatus && drawStatus !== 'drawStart'" @click="goOnstartDraw">
      继续添加
    </div>
    <div class="draw-end draw-btn" v-show="status && status !== 'end'" @click="endDraw(true)">绘制完成</div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, reactive, onMounted, onBeforeUnmount, computed, getCurrentInstance, watch} from 'vue-demi'
import type {Ref, UnwrapRef, ComputedRef, defineComponent as defineComponentOption} from 'vue-demo'
import {gySjMap, SGMap} from "../../../index";
import type {gySjmapType} from '../../../index'

export default defineComponent({
  name: 'GySjmapDraw',
  props: {
    oldDataList: {
      type: Array,
      default: () => ([])
    },
    drawTypeList: {
      type: Array,
      default: () => {
        return [
          'Point',
          'Line',
          'Circle',
          'Rect',
          'Polygon',
        ]
      }
    },
    drawTypeCnameList: {
      type: Array,
      default: () => {
        return [
          '点',
          '线',
          '圆',
          '矩形',
          '多边形',
        ]
      }
    },
    btnBackground: {
      type: String,
      default: 'rgb(102, 102, 102)',
    },
    btnColor: {
      type: String,
      default: '#fff',
    },
    btnActiveBackground: {
      type: String,
      default: 'rgb(142, 142, 142)',
    },
    btnActiveColor: {
      type: String,
      default: '#fff',
    },
  },
  emits: ['drawFinish'],
  setup(props, {emit}) {
    const drawCon: Ref<HTMLElement | null> = ref(null);
    const {proxy} = getCurrentInstance();
    const mapId: string = proxy.$parent.id;
    const gySjmapObj: Ref<UnwrapRef<gySjmapType>> = gySjMap(mapId);
    const mapFinish: ComputedRef<boolean> = computed(() => gySjmapObj.value && gySjmapObj.value.mapFinish);
    let drawObj: Ref<any> = ref(null);
    let isInit: boolean = false;
    const drawType: Ref<any> = ref('Point');
    const status = ref('');
    const drawListObj = reactive({
      Point: null,
      LineString: null,
      Circle: null,
      Polygon: null,
    });
    let pluginObj = {
      "Point": "DrawPointHandler",
      "Line": "DrawPolylineHandler",
      "Circle": "DrawCircleHandler",
      "Rect": "DrawRectangleHandler",
      "Polygon": "DrawPolygonHandler",
    }
    const drawStatus: Ref<string> = ref('');
    const addDrawPlugin = (typeStr?: string) => {
      return new Promise((resolve) => {
        let type = pluginObj[typeStr || drawType.value];
        SGMap.plugin([`SGMap.${type}`]).then((data) => {
          resolve(typeStr);
        });
      })
    }
    const startDraw = async () => {
      gySjmapObj.value.map.doubleClickZoom.disable();
      if (status.value === 'start') {
        return;
      }
      status.value = 'start';
      if (drawListObj[drawType.value]) {
        drawObj.value = drawListObj[drawType.value];
      } else {
        await addDrawPlugin();
        let type = pluginObj[drawType.value];
        drawObj.value = new SGMap[type]({
          drawColor: 'rgb(0, 153, 255)',
          editColor: 'rgb(255, 204, 51)',
          map: gySjmapObj.value.map,
          // 开启编辑功能
          enableEdit: true,
          // 编辑数据
          featuresList: []
        });
        drawListObj[drawType.value] = drawObj.value;
        addDrawEvent();
      }
      drawObj.value.startDraw();
    }
    let a = 0;
    const addDrawEvent = () => {

      let drawTypeObj = {
        "Point": "point",
        "Line": "polyline",
        "Circle": "circle",
        "Rect": "rectangle",
        "Polygon": "polygon",
      }
      let type = drawTypeObj[drawType.value];
      // point
      // polyline
      // polygon
      // rectangle
      // circle
      // 编辑结束
      if (a === 0) {
        drawObj.value.on(`draw.${type}.start`, function (data) {
          // 返回point
          drawStatus.value = 'drawStart'
        });
        drawObj.value.on(`edit.${type}.start`, function (data) {
          // 返回point
          drawStatus.value = 'drawEdit'
        });
        drawObj.value.on(`edit.${type}.end`, function (data) {
          // 返回point
          drawStatus.value = 'editEnd'
        });
        drawObj.value.on(`draw.${type}.end`, function (data) {
          // 返回point
          drawStatus.value = 'editEnd'
        });
      }
    }
    const goOnstartDraw = () => {
      drawObj.value.exitEdit();
      drawStatus.value = 'drawStart';
      drawObj.value.startDraw();
    }
    const deleteDraw = () => {
      if (status.value === 'start') {
        endDraw();
      }
      status.value = 'delete';
    }
    const changeDrawType = (type: any) => {
      if (drawStatus.value === 'drawStart') {
        return
      }
      drawType.value = type;
      if (status.value !== 'end') {
        endDraw();
        startDraw();
      }
    }
    const endDraw = (finish?: boolean) => {
      if (status.value !== 'end') {
        status.value = 'end';
        drawObj.value.endDraw();
        finish && submitData();
      }
    }
    const submitData = () => {
      if (drawStatus.value === 'drawStart') {
        return
      }
      let data = [];
      let keys = Object.keys(drawListObj);
      keys.forEach(v => {
        if (drawListObj[v]) {
          let features = drawListObj[v].getFeatures();
          features.forEach(val => {
            let coordinates = val.geometry.coordinates;
            switch (v) {
              case 'Circle':
                coordinates = val.properties.centerPoint;
                break;
              case 'Point':
                coordinates = coordinates;
                break;
              case 'Polygon':
                coordinates = coordinates[0];
                break;
            }
            let obj = {
              type: v,
              coordinates: coordinates,
            }
            if (v === 'Circle') {
              let radius = val.properties.radius;
              obj.radius = radius;
              obj.geometry = val.geometry;
            }
            data.push(obj);
          })
        }
      })
      emit('drawFinish', data);
    }
    const destory = () => {
    }
    const mapClick = () => {
      if (status.value === 'start' && drawObj.value._status !== 'drawStart') {
        drawObj.value.startDraw();
      }
    }
    let isInitData = false;
    const initOldData = () => {
      if (mapFinish.value && !isInitData) {
        let oldDataList = props.oldDataList;
        if (oldDataList.length === 0) {
          return;
        }
        isInitData = true;
        let typeArr = [...new Set(oldDataList.map(v => {
          return v.type
        }))];
        let typePluginArr = typeArr.map(v => {
          return 'SGMap.' + pluginObj[v]
        });
        SGMap.plugin(typePluginArr).then(() => {
          typeArr.forEach(type => {
            if (props.drawTypeList.includes(type)) {
              let pointArr = oldDataList.filter(v => v.type === type);
              let featuresList = [];
              pointArr.forEach((v, i) => {
                let obj = {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: v.coordinates,
                  },
                  properties: {
                    id: `drawPointId_${type}_${i}`
                  }
                };
                switch (type) {
                  case "Line":
                    obj.geometry.type = 'LineString';
                    break;
                  case "Circle":
                    if (v.geometry) {
                      obj.geometry = v.geometry;
                      obj.properties.centerPoint = v.coordinates;
                      obj.properties.radius = v.radius;
                    }
                    break;
                  case "Polygon":
                    let coor = [v.coordinates] as number[][][];
                    obj.geometry = {
                      type: "Polygon",
                      coordinates: coor,
                    }
                    break;
                  case "Rect":
                    let coor1 = [v.coordinates] as number[][][];
                    obj.geometry = {
                      type: "Polygon",
                      coordinates: coor1,
                    }
                    break;
                }
                if (obj) {
                  featuresList.push(obj)
                }
              })
              let pluginType = pluginObj[type];
              drawListObj[type] = new SGMap[pluginType]({
                drawColor: 'rgb(0, 153, 255)',
                editColor: 'rgb(255, 204, 51)',
                map: gySjmapObj.value.map,
                enableEdit: true,
                featuresList: featuresList
              });
            } else {
              console.error(type + ' 类型不正确')
            }
          })
        });
      }
    }
    watch(() => props.oldDataList, () => {
      initOldData();
    })
    watch(mapFinish, () => {
      initOldData();
    })
    onMounted(() => {
      initOldData();
      drawCon.value.style.setProperty('--btnBackground', props.btnBackground);
      drawCon.value.style.setProperty('--btnColor', props.btnColor);
      drawCon.value.style.setProperty('--deleteActiveBackground', props.deleteActiveBackground);
      drawCon.value.style.setProperty('--deleteActiveColor', props.deleteActiveColor);
      drawCon.value.style.setProperty('--btnActiveBackground', props.btnActiveBackground);
      drawCon.value.style.setProperty('--btnActiveColor', props.btnActiveColor);
    })
    onBeforeUnmount(() => {
      destory();
    })
    return {
      drawListObj,
      drawStatus,
      drawCon,
      drawType,
      status,
      gySjmapObj,
      mapFinish,
      startDraw,
      goOnstartDraw,
      deleteDraw,
      changeDrawType,
      endDraw,
      submitData,
      destory,
    }
  }
} as defineComponentOption)

</script>

<style lang='less' scoped>
.draw-btns-list {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 2;
  color: #fff;
  display: flex;
  --btnBackground: rgb(102, 102, 102);
  --btnColor: #fff;
  --btnActiveBackground: rgb(142, 142, 142);
  --btnActiveColor: #fff;
  --deleteActiveBackground: rgb(28 137 189);
  --deleteActiveColor: #fff;
}

.draw-btn {
  background: var(--btnBackground);
  color: var(--btnColor);
  font-size: 0.8rem;
  padding: 3px 5px;
  margin-right: 1rem;
  border-radius: 5px;
  cursor: pointer;

  &.active {
    background: var(--deleteActiveBackground);
    color: var(--deleteActiveColor);
  }
}

.draw-type-select {
  position: relative;

  &:hover {
    .draw-type-select-con {
      height: 113px;
      padding: 6px 0 10px;
    }
  }
}

.draw-type-select-con {
  position: absolute;
  left: 0;
  top: 80%;
  background: var(--btnBackground);
  width: 100%;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  box-sizing: border-box;
  height: 0;
  overflow: hidden;
  transition: all .3s linear;

  .draw-type-option {
    padding: 0 5px;
  }

  .active {
    background: var(--btnActiveBackground);
    color: var(--btnActiveColor);
  }
}

</style>
