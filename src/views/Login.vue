<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="../assets/logo.png" alt="Logo" class="logo">
        <h1>地理数据可视化系统</h1>
      </div>

      <el-form
          ref="loginForm"
          :model="loginData"
          :rules="rules"
          label-position="top"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginData.username"
              placeholder="用户名"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginData.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="loginData.remember">记住我</el-checkbox>
          <el-button type="text" @click="forgotPassword">忘记密码？</el-button>
        </div>

        <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>

      <div class="login-footer">
        <p>© {{ currentYear }} 地理数据可视化系统. All rights reserved.</p>
        <p>推荐使用 Chrome 浏览器访问</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../utils/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();

const loginData = ref({
  username: '',
  password: '',
  remember: false
});

const loading = ref(false);
const currentYear = computed(() => new Date().getFullYear());

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

// 处理登录
const handleLogin = async () => {
  loading.value = true;
  try {
    const userInfo = await login(loginData.value.username, loginData.value.password);

    // 保存登录状态
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    if (loginData.value.remember) {
      localStorage.setItem('remembered_username', loginData.value.username);
    } else {
      localStorage.removeItem('remembered_username');
    }

    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
};

const forgotPassword = () => {
  ElMessage.info('请联系系统管理员重置密码');
};

// 初始化记住的用户名
const rememberedUsername = localStorage.getItem('remembered_username');
if (rememberedUsername) {
  loginData.value.username = rememberedUsername;
  loginData.value.remember = true;
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1c92d2 0%, #f2fcfe 100%);

  .login-container {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      .logo {
        width: 80px;
        height: 80px;
        margin-bottom: 20px;
      }

      h1 {
        font-size: 24px;
        color: #303133;
        margin: 0;
      }
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .login-button {
      width: 100%;
      height: 40px;
      font-size: 16px;
    }

    .login-footer {
      margin-top: 40px;
      text-align: center;
      color: #909399;
      font-size: 12px;

      p {
        margin: 5px 0;
      }
    }
  }
}
</style>