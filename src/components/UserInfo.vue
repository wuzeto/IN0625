<template>
  <div class="user-info">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="user-avatar">
        <el-avatar :size="40" :src="avatarUrl">
          {{ userInitials }}
        </el-avatar>
        <span class="user-name">{{ username }}</span>
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">
            <el-icon><User /></el-icon>
            个人信息
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            系统设置
          </el-dropdown-item>
          <el-dropdown-item command="theme">
            <el-icon><Moon /></el-icon>
            切换主题
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 个人信息对话框 -->
    <el-dialog
      v-model="showProfile"
      title="个人信息"
      width="400px"
    >
      <div class="profile-content">
        <div class="avatar-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar
              :size="100"
              :src="avatarUrl"
            >
              {{ userInitials }}
            </el-avatar>
            <div class="upload-mask">
              <el-icon><Camera /></el-icon>
            </div>
          </el-upload>
        </div>
        
        <el-form :model="userForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userForm.email" />
          </el-form-item>
          <el-form-item label="角色">
            <el-tag>{{ userForm.role }}</el-tag>
          </el-form-item>
          <el-form-item label="加入时间">
            <span>{{ formatDate(userForm.joinDate) }}</span>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!-- 系统设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="系统设置"
      width="500px"
    >
      <el-tabs v-model="activeSettingsTab">
        <!-- 地图设置 -->
        <el-tab-pane label="地图设置" name="map">
          <el-form :model="mapSettings" label-width="100px">
            <el-form-item label="默认中心点">
              <el-input-number
                v-model="mapSettings.centerLat"
                :precision="6"
                :step="0.000001"
                placeholder="纬度"
              />
              <el-input-number
                v-model="mapSettings.centerLng"
                :precision="6"
                :step="0.000001"
                placeholder="经度"
              />
            </el-form-item>
            <el-form-item label="默认缩放级别">
              <el-slider
                v-model="mapSettings.zoom"
                :min="1"
                :max="18"
                :marks="{
                  1: '世界',
                  5: '国家',
                  10: '城市',
                  15: '街道',
                  18: '建筑'
                }"
              />
            </el-form-item>
            <el-form-item label="地图样式">
              <el-select v-model="mapSettings.style">
                <el-option label="标准" value="standard" />
                <el-option label="卫星" value="satellite" />
                <el-option label="暗黑" value="dark" />
                <el-option label="地形" value="terrain" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 数据设置 -->
        <el-tab-pane label="数据设置" name="data">
          <el-form :model="dataSettings" label-width="120px">
            <el-form-item label="自动刷新">
              <el-switch v-model="dataSettings.autoRefresh" />
            </el-form-item>
            <el-form-item 
              label="刷新间隔(秒)"
              v-if="dataSettings.autoRefresh"
            >
              <el-input-number
                v-model="dataSettings.refreshInterval"
                :min="5"
                :max="3600"
                :step="5"
              />
            </el-form-item>
            <el-form-item label="数据缓存">
              <el-switch v-model="dataSettings.enableCache" />
            </el-form-item>
            <el-form-item label="缓存大小限制">
              <el-select v-model="dataSettings.cacheLimit">
                <el-option label="100MB" value="100" />
                <el-option label="500MB" value="500" />
                <el-option label="1GB" value="1000" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 显示设置 -->
        <el-tab-pane label="显示设置" name="display">
          <el-form :model="displaySettings" label-width="100px">
            <el-form-item label="主题模式">
              <el-radio-group v-model="displaySettings.theme">
                <el-radio-button label="light">浅色</el-radio-button>
                <el-radio-button label="dark">深色</el-radio-button>
                <el-radio-button label="auto">自动</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="displaySettings.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="动画效果">
              <el-switch v-model="displaySettings.enableAnimation" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  ArrowDown, User, Setting, Moon, SwitchButton,
  Camera 
} from '@element-plus/icons-vue';
import { formatDate } from '../utils/formatters';

// 用户信息
const username = ref('wuzeto');
const avatarUrl = ref('');
const userInitials = computed(() => {
  return username.value.substring(0, 2).toUpperCase();
});

// 对话框控制
const showProfile = ref(false);
const showSettings = ref(false);
const activeSettingsTab = ref('map');

// 用户表单
const userForm = ref({
  username: 'wuzeto',
  email: 'wuzeto@example.com',
  role: '管理员',
  joinDate: new Date('2024-01-01')
});

// 设置表单
const mapSettings = ref({
  centerLat: 35.86166,
  centerLng: 104.195397,
  zoom: 4,
  style: 'standard'
});

const dataSettings = ref({
  autoRefresh: true,
  refreshInterval: 30,
  enableCache: true,
  cacheLimit: '500'
});

const displaySettings = ref({
  theme: 'light',
  language: 'zh-CN',
  enableAnimation: true
});

// 处理命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      showProfile.value = true;
      break;
    case 'settings':
      showSettings.value = true;
      break;
    case 'theme':
      toggleTheme();
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 头像上传
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }

  // 模拟上传
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
  return false;
};

// 切换主题
const toggleTheme = () => {
  const currentTheme = displaySettings.value.theme;
  displaySettings.value.theme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme();
};

// 应用主题
const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', displaySettings.value.theme);
};

// 保存设置
const saveSettings = () => {
  // 保存设置到本地存储
  localStorage.setItem('mapSettings', JSON.stringify(mapSettings.value));
  localStorage.setItem('dataSettings', JSON.stringify(dataSettings.value));
  localStorage.setItem('displaySettings', JSON.stringify(displaySettings.value));
  
  ElMessage.success('设置已保存');
  showSettings.value = false;
  
  // 应用新设置
  applyTheme();
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行退出登录逻辑
    ElMessage.success('已退出登录');
  }).catch(() => {});
};
</script>

<style lang="scss" scoped>
.user-info {
  .user-avatar {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .user-name {
      margin: 0 8px;
      font-size: 14px;
    }
  }

  .profile-content {
    .avatar-upload {
      text-align: center;
      margin-bottom: 20px;
      position: relative;
      display: inline-block;

      .upload-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;

        .el-icon {
          font-size: 24px;
          color: white;
        }
      }

      &:hover .upload-mask {
        opacity: 1;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>