<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <!-- 设置导航 -->
        <div class="settings-nav">
          <el-menu
              :default-active="activeMenu"
              class="settings-menu"
              @select="handleMenuSelect"
          >
            <el-menu-item index="general">
              <el-icon><Setting /></el-icon>
              <span>基本设置</span>
            </el-menu-item>
            <el-menu-item index="map">
              <el-icon><MapLocation /></el-icon>
              <span>地图设置</span>
            </el-menu-item>
            <el-menu-item index="data">
              <el-icon><DataLine /></el-icon>
              <span>数据设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="about">
              <el-icon><InfoFilled /></el-icon>
              <span>关于系统</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <el-col :span="18">
        <!-- 设置内容 -->
        <div class="settings-content">
          <!-- 基本设置 -->
          <div v-show="activeMenu === 'general'" class="settings-section">
            <h2>基本设置</h2>
            <el-form label-width="120px">
              <el-form-item label="系统名称">
                <el-input v-model="settings.general.systemName" />
              </el-form-item>
              <el-form-item label="默认语言">
                <el-select v-model="settings.general.language">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>
              <el-form-item label="主题色">
                <el-color-picker v-model="settings.general.theme" />
              </el-form-item>
              <el-form-item label="导航模式">
                <el-radio-group v-model="settings.general.navigation">
                  <el-radio label="sidebar">侧边栏</el-radio>
                  <el-radio label="horizontal">顶部导航</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>

          <!-- 地图设置 -->
          <div v-show="activeMenu === 'map'" class="settings-section">
            <h2>地图设置</h2>
            <el-form label-width="120px">
              <el-form-item label="地图提供商">
                <el-select v-model="settings.map.provider">
                  <el-option label="OpenStreetMap" value="osm" />
                  <el-option label="高德地图" value="amap" />
                  <el-option label="Google Maps" value="google" />
                </el-select>
              </el-form-item>
              <el-form-item label="默认中心点">
                <el-input-number v-model="settings.map.center[0]" :precision="6" :step="0.000001" />
                <el-input-number v-model="settings.map.center[1]" :precision="6" :step="0.000001" />
              </el-form-item>
              <el-form-item label="默认缩放级别">
                <el-slider v-model="settings.map.zoom" :min="1" :max="18" />
              </el-form-item>
              <el-form-item label="聚合设置">
                <el-switch v-model="settings.map.cluster" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 数据设置 -->
          <div v-show="activeMenu === 'data'" class="settings-section">
            <h2>数据设置</h2>
            <el-form label-width="120px">
              <el-form-item label="数据刷新间隔">
                <el-input-number v-model="settings.data.refreshInterval" :min="5" :step="5">
                  <template #append>秒</template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="历史数据保留">
                <el-input-number v-model="settings.data.retention" :min="1">
                  <template #append>天</template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="数据缓存">
                <el-switch v-model="settings.data.cache" />
              </el-form-item>
              <el-form-item label="导出格式">
                <el-select v-model="settings.data.exportFormat">
                  <el-option label="CSV" value="csv" />
                  <el-option label="JSON" value="json" />
                  <el-option label="Excel" value="excel" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 通知设置 -->
          <div v-show="activeMenu === 'notification'" class="settings-section">
            <h2>通知设置</h2>
            <el-form label-width="120px">
              <el-form-item label="系统通知">
                <el-switch v-model="settings.notification.system" />
              </el-form-item>
              <el-form-item label="邮件通知">
                <el-switch v-model="settings.notification.email" />
              </el-form-item>
              <el-form-item label="告警阈值">
                <el-input-number v-model="settings.notification.threshold" :min="0" />
              </el-form-item>
              <el-form-item label="通知时段">
                <el-time-picker
                    v-model="settings.notification.timeRange"
                    is-range
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 安全设置 -->
          <div v-show="activeMenu === 'security'" class="settings-section">
            <h2>安全设置</h2>
            <el-form label-width="120px">
              <el-form-item label="登录超时">
                <el-input-number v-model="settings.security.timeout" :min="1">
                  <template #append>分钟</template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="密码有效期">
                <el-input-number v-model="settings.security.passwordExpiry" :min="30">
                  <template #append>天</template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="双因素认证">
                <el-switch v-model="settings.security.twoFactor" />
              </el-form-item>
              <el-form-item label="IP白名单">
                <el-input
                    v-model="settings.security.ipWhitelist"
                    type="textarea"
                    placeholder="每行一个IP地址"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 关于系统 -->
          <div v-show="activeMenu === 'about'" class="settings-section">
            <h2>关于系统</h2>
            <el-descriptions border>
              <el-descriptions-item label="系统版本">1.0.0</el-descriptions-item>
              <el-descriptions-item label="更新时间">2025-06-25</el-descriptions-item>
              <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
              <el-descriptions-item label="技术支持">support@example.com</el-descriptions-item>
              <el-descriptions-item label="文档">
                <el-link type="primary" href="#" target="_blank">在线文档</el-link>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 保存按钮 -->
          <div class="settings-actions">
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
            <el-button @click="resetSettings">重置</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  Setting,
  MapLocation,
  DataLine,
  Bell,
  Lock,
  InfoFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 当前激活的菜单
const activeMenu = ref('general');

// 设置数据
const settings = ref({
  general: {
    systemName: '地理数据可视化系统',
    language: 'zh-CN',
    theme: '#409EFF',
    navigation: 'sidebar'
  },
  map: {
    provider: 'osm',
    center: [116.397428, 39.90923],
    zoom: 12,
    cluster: true
  },
  data: {
    refreshInterval: 30,
    retention: 30,
    cache: true,
    exportFormat: 'csv'
  },
  notification: {
    system: true,
    email: false,
    threshold: 90,
    timeRange: [new Date(2025, 5, 25, 9, 0), new Date(2025, 5, 25, 18, 0)]
  },
  security: {
    timeout: 30,
    passwordExpiry: 90,
    twoFactor: false,
    ipWhitelist: ''
  }
});

// 菜单选择处理
const handleMenuSelect = (index) => {
  activeMenu.value = index;
};

// 保存设置
const saveSettings = () => {
  // 这里添加保存设置的逻辑
  localStorage.setItem('systemSettings', JSON.stringify(settings.value));
  ElMessage.success('设置保存成功');
};

// 重置设置
const resetSettings = () => {
  // 这里添加重置设置的逻辑
  const defaultSettings = localStorage.getItem('systemSettings');
  if (defaultSettings) {
    settings.value = JSON.parse(defaultSettings);
    ElMessage.success('设置已重置');
  }
};

// 初始化时加载保存的设置
const initSettings = () => {
  const savedSettings = localStorage.getItem('systemSettings');
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings);
  }
};

// 初始化
initSettings();
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .settings-nav {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .settings-menu {
      border-right: none;
    }
  }

  .settings-content {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;

    .settings-section {
      h2 {
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
        font-size: 18px;
        font-weight: normal;
      }

      .el-form {
        max-width: 600px;
      }
    }

    .settings-actions {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
      text-align: right;

      .el-button {
        margin-left: 10px;
      }
    }
  }
}

// 自定义样式
:deep(.el-input-number) {
  width: 180px;
  margin-right: 10px;
}

:deep(.el-time-picker) {
  width: 300px;
}

:deep(.el-descriptions) {
  margin-top: 20px;
}
</style>