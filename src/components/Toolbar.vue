<template>
  <div class="toolbar">
    <!-- 主工具栏 -->
    <el-card class="tool-panel" shadow="hover">
      <el-space direction="vertical" size="large">
        <!-- 地图工具 -->
        <el-button-group>
          <el-tooltip content="平移" placement="right">
            <el-button
              :type="currentTool === 'pan' ? 'primary' : 'default'"
              @click="setTool('pan')"
            >
              <el-icon><Rank /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="测距" placement="right">
            <el-button
              :type="currentTool === 'measure' ? 'primary' : 'default'"
              @click="setTool('measure')"
            >
              <el-icon><Position /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="绘制" placement="right">
            <el-button
              :type="currentTool === 'draw' ? 'primary' : 'default'"
              @click="setTool('draw')"
            >
              <el-icon><EditPen /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider />

        <!-- 视图控制 -->
        <el-button-group>
          <el-tooltip content="全屏" placement="right">
            <el-button @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重置视图" placement="right">
            <el-button @click="resetView">
              <el-icon><House /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider />

        <!-- 数据工具 -->
        <el-button-group>
          <el-tooltip content="数据面板" placement="right">
            <el-button @click="toggleDataPanel">
              <el-icon><DataAnalysis /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="添加数据" placement="right">
            <el-button @click="showAddData">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="导出数据" placement="right">
            <el-button @click="exportData">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </el-space>
    </el-card>

    <!-- 测距工具面板 -->
    <el-card v-if="currentTool === 'measure'" class="measure-panel" shadow="hover">
      <template #header>
        <div class="panel-header">
          <span>测距工具</span>
          <el-button type="text" @click="clearMeasure">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="measure-content">
        <p>总距离: {{ formatDistance(measureDistance) }}</p>
        <p>点击地图开始测距</p>
        <p>双击结束测距</p>
      </div>
    </el-card>

    <!-- 绘制工具面板 -->
    <el-card v-if="currentTool === 'draw'" class="draw-panel" shadow="hover">
      <template #header>
        <div class="panel-header">
          <span>绘制工具</span>
          <el-button type="text" @click="clearDraw">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="draw-content">
        <el-radio-group v-model="drawType" size="small">
          <el-radio-button label="point">点</el-radio-button>
          <el-radio-button label="polyline">线</el-radio-button>
          <el-radio-button label="polygon">面</el-radio-button>
          <el-radio-button label="rectangle">矩形</el-radio-button>
          <el-radio-button label="circle">圆形</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { 
  Rank, Position, EditPen, FullScreen, 
  House, DataAnalysis, Plus, Download, Delete 
} from '@element-plus/icons-vue';
import { formatDistance } from '../utils/formatters';

const emit = defineEmits([
  'tool-change',
  'fullscreen',
  'reset-view',
  'toggle-panel',
  'add-data',
  'export-data',
  'measure-clear',
  'draw-clear',
  'draw-type-change'
]);

// 状态
const currentTool = ref('pan');
const drawType = ref('point');
const measureDistance = ref(0);

// 工具切换
const setTool = (tool) => {
  if (currentTool.value === tool) {
    currentTool.value = 'pan';
  } else {
    currentTool.value = tool;
  }
  emit('tool-change', currentTool.value);
};

// 视图控制
const toggleFullscreen = () => {
  emit('fullscreen');
};

const resetView = () => {
  emit('reset-view');
};

// 数据操作
const toggleDataPanel = () => {
  emit('toggle-panel', 'data');
};

const showAddData = () => {
  emit('add-data');
};

const exportData = () => {
  emit('export-data');
};

// 测距工具
const clearMeasure = () => {
  measureDistance.value = 0;
  emit('measure-clear');
};

// 绘制工具
const clearDraw = () => {
  emit('draw-clear');
};

// 监听绘制类型变化
watch(drawType, (newType) => {
  emit('draw-type-change', newType);
});

defineExpose({
  setMeasureDistance: (distance) => {
    measureDistance.value = distance;
  }
});
</script>

<style lang="scss" scoped>
.toolbar {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 1000;

  .tool-panel {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }

  .measure-panel,
  .draw-panel {
    margin-top: 10px;
    width: 200px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .measure-content,
    .draw-content {
      padding: 10px 0;
      text-align: center;

      p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
      }
    }

    .draw-content {
      .el-radio-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }
  }
}
</style>