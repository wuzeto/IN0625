<template>
  <div id="app">
    <el-container>
      <el-aside width="200px">
        <el-menu router default-active="/" background-color="#304156" text-color="#fff">
          <el-menu-item index="/">
            <el-icon><Location /></el-icon>
            <span>地图可视化</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据分析</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><PieChart /></el-icon>
            <span>统计信息</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header height="60px">地理信息可视化平台</el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { Location, DataAnalysis, PieChart, Setting } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Location,
    DataAnalysis,
    PieChart,
    Setting
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

#app {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>