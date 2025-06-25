<template>
  <div class="status-bar">
    <!-- 坐标显示 -->
    <div class="coordinates" v-if="currentPosition">
      <span>经度: {{ formatCoordinate(currentPosition.lng, 'E') }}</span>
      <span>纬度: {{ formatCoordinate(currentPosition.lat, 'N') }}</span>
    </div>

    <!-- 比例尺 -->
    <div class="scale">1:{{ formatNumber(scale) }}</div>

    <!-- 系统状态 -->
    <div class="system-status">
      <el-tooltip 
        :content="'上次更新: ' + formatDate(lastUpdate)"
        placement="top"
      >
        <span class="status-item">
          <el-icon :class="{ 'is-loading': loading }">
            <Loading v-if="loading" />
            <Select v-else />
          </el-icon>
          {{ pointCount }} 个数据点
        </span>
      </el-tooltip>

      <span class="status-item">
        <el-icon><Clock /></el-icon>
        {{ currentTime }}
      </span>

      <span class="status-item user">
        <el-icon><User /></el-icon>
        {{ username }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Loading, Select, Clock, User } from '@element-plus/icons-vue';
import { formatCoordinate, formatNumber, formatDate } from '../utils/formatters';

const props = defineProps({
  currentPosition: {
    type: Object,
    default: null
  },
  scale: {
    type: Number,
    default: 10000
  },
  pointCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Date,
    default: () => new Date()
  }
});

const username = ref('wuzeto');
const currentTime = ref('');
let timer = null;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const updateTime = () => {
  const now = new Date();
  currentTime.value = formatDate(now, 'HH:mm:ss');
};
</script>

<style lang="scss" scoped>
.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 12px;
  color: #606266;
  z-index: 1000;

  .coordinates,
  .scale,
  .system-status {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .coordinates {
    flex: 1;
  }

  .scale {
    border-left: 1px solid #dcdfe6;
    border-right: 1px solid #dcdfe6;
    padding: 0 20px;
  }

  .system-status {
    flex: 1;
    justify-content: flex-end;

    .status-item {
      display: flex;
      align-items: center;
      gap: 5px;

      .el-icon {
        font-size: 14px;

        &.is-loading {
          animation: rotating 2s linear infinite;
        }
      }

      &.user {
        font-weight: bold;
      }
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>