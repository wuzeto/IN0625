<template>
  <div class="system-message">
    <transition-group name="message-list">
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="message-item"
        :class="msg.type"
      >
        <el-icon class="message-icon">
          <component :is="getIcon(msg.type)" />
        </el-icon>
        <div class="message-content">
          <div class="message-title">{{ msg.title }}</div>
          <div class="message-text">{{ msg.text }}</div>
          <div class="message-time">{{ formatTime(msg.time) }}</div>
        </div>
        <el-button
          class="close-btn"
          link
          @click="removeMessage(msg.id)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  InfoFilled, SuccessFilled, Warning, CircleCloseFilled,
  Close 
} from '@element-plus/icons-vue';

const messages = ref([]);
let messageId = 0;

const getIcon = (type) => {
  const icons = {
    info: InfoFilled,
    success: SuccessFilled,
    warning: Warning,
    error: CircleCloseFilled
  };
  return icons[type] || InfoFilled;
};

const formatTime = (time) => {
  const now = new Date();
  const msgTime = new Date(time);
  const diff = now - msgTime;

  if (diff < 60000) { // 小于1分钟
    return '刚刚';
  } else if (diff < 3600000) { // 小于1小时
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) { // 小于24小时
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return msgTime.toLocaleString();
  }
};

const addMessage = (message) => {
  const id = messageId++;
  messages.value.unshift({
    id,
    time: new Date(),
    ...message
  });

  // 自动移除
  setTimeout(() => {
    removeMessage(id);
  }, message.duration || 5000);
};

const removeMessage = (id) => {
  const index = messages.value.findIndex(msg => msg.id === id);
  if (index !== -1) {
    messages.value.splice(index, 1);
  }
};

defineExpose({
  addMessage
});
</script>

<style lang="scss" scoped>
.system-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 300px;
  pointer-events: none;

  .message-item {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    display: flex;
    align-items: flex-start;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    pointer-events: auto;

    &.info {
      border-left: 4px solid #409EFF;
      .message-icon { color: #409EFF; }
    }

    &.success {
      border-left: 4px solid #67C23A;
      .message-icon { color: #67C23A; }
    }

    &.warning {
      border-left: 4px solid #E6A23C;
      .message-icon { color: #E6A23C; }
    }

    &.error {
      border-left: 4px solid #F56C6C;
      .message-icon { color: #F56C6C; }
    }

    .message-icon {
      font-size: 20px;
      margin-right: 12px;
      margin-top: 2px;
    }

    .message-content {
      flex: 1;

      .message-title {
        font-weight: bold;
        margin-bottom: 4px;
      }

      .message-text {
        font-size: 14px;
        color: #606266;
      }

      .message-time {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .close-btn {
      margin-left: 8px;
    }
  }
}

.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s ease;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>