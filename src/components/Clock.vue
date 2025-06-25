<template>
  <div class="clock-widget" :class="{ 'is-dark': dark }">
    <div class="time-display">
      <div class="time">{{ formattedTime }}</div>
      <div class="date">{{ formattedDate }}</div>
    </div>
    <div class="timezone">
      <el-dropdown trigger="click" @command="handleTimezoneChange">
        <span class="timezone-text">
          {{ currentTimezone }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="UTC">UTC</el-dropdown-item>
            <el-dropdown-item command="local">本地时间</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
});

const formattedTime = ref('');
const formattedDate = ref('');
const currentTimezone = ref('UTC');
let timer = null;

const updateTime = () => {
  const now = new Date();
  if (currentTimezone.value === 'UTC') {
    formattedTime.value = now.toISOString().slice(11, 19);
    formattedDate.value = now.toISOString().slice(0, 10);
  } else {
    formattedTime.value = now.toLocaleTimeString();
    formattedDate.value = now.toLocaleDateString();
  }
};

const handleTimezoneChange = (timezone) => {
  currentTimezone.value = timezone;
  updateTime();
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.clock-widget {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  &.is-dark {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    
    .timezone-text {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .time-display {
    text-align: center;
    
    .time {
      font-size: 24px;
      font-weight: bold;
      font-family: monospace;
    }
    
    .date {
      font-size: 14px;
      color: #909399;
    }
  }

  .timezone {
    margin-top: 8px;
    text-align: center;
    
    .timezone-text {
      cursor: pointer;
      font-size: 12px;
      color: #606266;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style>