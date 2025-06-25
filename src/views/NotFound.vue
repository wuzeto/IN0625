<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;

  .content {
    text-align: center;

    h1 {
      font-size: 120px;
      margin: 0;
      background: linear-gradient(135deg, #1c92d2 0%, #f2fcfe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      font-size: 30px;
      margin: 0;
      color: #303133;
    }

    p {
      margin: 20px 0;
      color: #606266;
    }
  }
}
</style>