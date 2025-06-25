<template>
  <el-card class="legend" shadow="hover">
    <template #header>
      <div class="legend-header">
        <span>图例</span>
        <el-switch
          v-model="visible"
          @change="toggleVisibility"
        />
      </div>
    </template>
    
    <!-- 图例内容 -->
    <div class="legend-content" v-show="visible">
      <!-- 热力图图例 -->
      <div v-if="showHeatmapLegend" class="legend-section">
        <h4>热力值分布</h4>
        <div class="heatmap-gradient">
          <div class="gradient-bar"></div>
          <div class="gradient-labels">
            <span>{{ formatNumber(heatmapRange.min) }}</span>
            <span>{{ formatNumber(heatmapRange.max) }}</span>
          </div>
        </div>
      </div>

      <!-- 点图例 -->
      <div v-if="showPointLegend" class="legend-section">
        <h4>点数据类型</h4>
        <div class="point-types">
          <div 
            v-for="type in pointTypes" 
            :key="type.name"
            class="point-type"
          >
            <span 
              class="point-symbol"
              :style="{ backgroundColor: type.color }"
            ></span>
            <span class="point-label">{{ type.name }}</span>
          </div>
        </div>
      </div>

      <!-- 区域图例 -->
      <div v-if="showRegionLegend" class="legend-section">
        <h4>区域分类</h4>
        <div class="region-types">
          <div 
            v-for="region in regionTypes" 
            :key="region.name"
            class="region-type"
          >
            <span 
              class="region-symbol"
              :style="{
                backgroundColor: region.fillColor,
                borderColor: region.strokeColor
              }"
            ></span>
            <span class="region-label">{{ region.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useLayerStore } from '../stores/layer';
import { formatNumber } from '../utils/formatters';

const props = defineProps({
  heatmapRange: {
    type: Object,
    default: () => ({ min: 0, max: 100 })
  },
  pointTypes: {
    type: Array,
    default: () => []
  },
  regionTypes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['visibility-change']);

const layerStore = useLayerStore();
const visible = ref(true);

// 显示控制
const showHeatmapLegend = computed(() => {
  return layerStore.hasVisibleLayer('heatmap');
});

const showPointLegend = computed(() => {
  return layerStore.hasVisibleLayer('point');
});

const showRegionLegend = computed(() => {
  return layerStore.hasVisibleLayer('region');
});

const toggleVisibility = (value) => {
  emit('visibility-change', value);
};
</script>

<style lang="scss" scoped>
.legend {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  .legend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .legend-content {
    .legend-section {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #606266;
      }
    }

    .heatmap-gradient {
      .gradient-bar {
        height: 20px;
        border-radius: 4px;
        background: linear-gradient(to right,
          blue 0%,
          cyan 40%,
          lime 60%,
          yellow 80%,
          red 100%
        );
      }

      .gradient-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 12px;
        color: #909399;
      }
    }

    .point-types,
    .region-types {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .point-type,
      .region-type {
        display: flex;
        align-items: center;
        gap: 8px;

        .point-symbol {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .region-symbol {
          width: 16px;
          height: 16px;
          border: 2px solid;
          border-radius: 2px;
        }

        .point-label,
        .region-label {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }
}
</style>