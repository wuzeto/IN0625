<template>
  <div class="data-filter">
    <el-form :model="filters" label-position="top">
      <!-- 时间范围过滤 -->
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="filters.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :shortcuts="dateShortcuts"
          @change="handleFilterChange"
        />
      </el-form-item>

      <!-- 数值范围过滤 -->
      <el-form-item label="数值范围">
        <el-slider
          v-model="filters.valueRange"
          range
          :min="0"
          :max="100"
          @change="handleFilterChange"
        />
      </el-form-item>

      <!-- 图层选择 -->
      <el-form-item label="显示图层">
        <el-checkbox-group 
          v-model="filters.layers"
          @change="handleFilterChange"
        >
          <el-checkbox 
            v-for="layer in availableLayers"
            :key="layer.id"
            :label="layer.id"
          >
            {{ layer.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 类别过滤 -->
      <el-form-item label="数据类别">
        <el-select
          v-model="filters.categories"
          multiple
          collapse-tags
          placeholder="选择类别"
          @change="handleFilterChange"
        >
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </el-form-item>

      <!-- 空间范围 -->
      <el-form-item label="空间范围">
        <el-radio-group 
          v-model="filters.spatialFilter"
          @change="handleFilterChange"
        >
          <el-radio label="all">全部</el-radio>
          <el-radio label="visible">可视区域</el-radio>
          <el-radio label="custom">自定义</el-radio>
        </el-radio-group>
        
        <template v-if="filters.spatialFilter === 'custom'">
          <el-button 
            size="small" 
            @click="startDrawing"
            :disabled="isDrawing"
          >
            绘制区域
          </el-button>
        </template>
      </el-form-item>
    </el-form>

    <!-- 筛选统计 -->
    <div class="filter-stats">
      <el-alert
        :title="`已筛选 ${filteredCount} 条数据`"
        type="info"
        :closable="false"
      >
        <template #default>
          <el-button 
            type="text" 
            @click="resetFilters"
          >
            重置筛选
          </el-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useLayerStore } from '../stores/layer';
import { useDataStore } from '../stores/data';
import { storeToRefs } from 'pinia';

const layerStore = useLayerStore();
const dataStore = useDataStore();
const { availableLayers } = storeToRefs(layerStore);
const { filteredCount } = storeToRefs(dataStore);

const emit = defineEmits(['filter-change', 'draw-start', 'draw-end']);

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近24小时',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  }
];

// 过滤器状态
const filters = ref({
  timeRange: null,
  valueRange: [0, 100],
  layers: [],
  categories: [],
  spatialFilter: 'all'
});

// 是否正在绘制区域
const isDrawing = ref(false);

// 可用类别列表
const categories = computed(() => {
  return dataStore.getUniqueCategories();
});

// 处理过滤器变化
const handleFilterChange = () => {
  emit('filter-change', { ...filters.value });
};

// 开始绘制区域
const startDrawing = () => {
  isDrawing.value = true;
  emit('draw-start');
};

// 重置过滤器
const resetFilters = () => {
  filters.value = {
    timeRange: null,
    valueRange: [0, 100],
    layers: [],
    categories: [],
    spatialFilter: 'all'
  };
  handleFilterChange();
};

// 接收绘制完成的回调
const handleDrawComplete = (geometry) => {
  isDrawing.value = false;
  filters.value.customArea = geometry;
  handleFilterChange();
};

defineExpose({
  handleDrawComplete
});
</script>

<style lang="scss" scoped>
.data-filter {
  padding: 20px;

  .el-form-item {
    margin-bottom: 20px;
  }

  .filter-stats {
    margin-top: 20px;

    .el-alert {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>