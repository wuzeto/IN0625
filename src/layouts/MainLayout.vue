<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo">
        <span v-show="!isCollapsed">地理数据可视化系统</span>
      </div>

      <el-menu
          :collapse="isCollapsed"
          :default-active="activeMenu"
          router
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <template #title>数据总览</template>
        </el-menu-item>

        <el-menu-item index="/map">
          <el-icon><Location /></el-icon>
          <template #title>地图展示</template>
        </el-menu-item>

        <el-menu-item index="/analysis">
          <el-icon><DataLine /></el-icon>
          <template #title>数据分析</template>
        </el-menu-item>

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="header">
        <el-button
            :icon="isCollapsed ? Expand : Fold"
            @click="toggleSidebar"
        />

        <div class="header-right">
          <el-tooltip content="刷新" placement="bottom">
            <el-button :icon="Refresh" circle @click="refreshPage" />
          </el-tooltip>

          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userAvatar">
                {{ userInfo?.name?.charAt(0) }}
              </el-avatar>
              <span v-show="!isCollapsed">{{ userInfo?.name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  Fold,
  Expand,
  Monitor,
  Location,
  DataLine,
  Setting,
  Refresh,
  User,
  SwitchButton
} from '@element-plus/icons-vue';
import { getCurrentUser, logout } from '../utils/auth';

const router = useRouter();
const isCollapsed = ref(false);
const userInfo = ref(getCurrentUser());
const activeMenu = computed(() => router.currentRoute.value.path);

// 用户头像
const userAvatar = computed(() => {
  return userInfo.value?.avatar || '';
});

// 切换侧边栏
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 刷新页面
const refreshPage = () => {
  window.location.reload();
};

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm(
            '确定要退出登录吗？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
        );
        logout();
        router.push('/login');
      } catch {
        // 用户取消退出
      }
      break;
  }
};
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  height: 100vh;

  .sidebar {
    width: 240px;
    height: 100%;
    background-color: #304156;
    transition: width 0.3s;
    overflow-x: hidden;

    &.collapsed {
      width: 64px;
    }

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      color: white;

      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }

      span {
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    :deep(.el-menu) {
      border-right: none;
      background-color: transparent;

      .el-menu-item {
        color: #bfcbd9;

        &:hover, &.is-active {
          color: #409EFF;
          background-color: #263445;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background-color: white;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .el-avatar {
          background-color: #409EFF;
        }
      }
    }

    .content {
      flex: 1;
      padding: 16px;
      overflow: auto;
      background-color: #f5f7fa;
    }
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>