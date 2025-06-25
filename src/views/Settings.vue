<template>
  <div>
    <h2>系统设置</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password })
        });
        const result = await response.json();
        localStorage.setItem('token', result.token); // 存储 JWT Token
        alert('登录成功');
      } catch (error) {
        console.error(error);
        alert('登录失败');
      }
    }
  }
};
</script>
