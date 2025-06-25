<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="100" :src="userInfo.avatar">
              {{ userInfo.name?.charAt(0) }}
            </el-avatar>
            <h2>{{ userInfo.name }}</h2>
            <p class="user-role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
          </div>
          <div class="profile-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo.email || '未设置邮箱' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ userInfo.phone || '未设置手机' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Timer /></el-icon>
              <span>上次登录: {{ formatDate(userInfo.lastLogin) }}</span>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary" @click="showEditDialog = true">
              编辑资料
            </el-button>
            <el-button @click="showPasswordDialog = true">
              修改密码
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 活动日志 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活动日志</span>
              <el-radio-group v-model="logType" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="login">登录</el-radio-button>
                <el-radio-button label="operation">操作</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
                v-for="log in filteredLogs"
                :key="log.id"
                :timestamp="formatDate(log.timestamp)"
                :type="getLogType(log.type)"
            >
              {{ log.content }}
              <div class="log-meta">
                <span>IP: {{ log.ip }}</span>
                <span>设备: {{ log.device }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>

          <div class="load-more" v-if="hasMoreLogs">
            <el-button link @click="loadMoreLogs">加载更多</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog
        v-model="showEditDialog"
        title="编辑个人资料"
        width="500px"
    >
      <el-form
          ref="editForm"
          :model="editData"
          :rules="editRules"
          label-width="80px"
      >
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
          >
            <el-avatar
                v-if="editData.avatar"
                :src="editData.avatar"
                :size="100"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editData.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editData.email" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="editData.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveProfile">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
        v-model="showPasswordDialog"
        title="修改密码"
        width="500px"
    >
      <el-form
          ref="passwordForm"
          :model="passwordData"
          :rules="passwordRules"
          label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
              v-model="passwordData.currentPassword"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordData.newPassword"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="passwordData.confirmPassword"
              type="password"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  User,
  Message,
  Phone,
  Timer,
  Plus
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 用户信息
const userInfo = ref({
  username: 'wuzeto',
  name: '吴泽涛',
  role: 'admin',
  email: 'wuzeto@example.com',
  phone: '13800138000',
  avatar: '',
  lastLogin: '2025-06-25 12:20:25'
});

// 活动日志
const logs = ref([
  {
    id: 1,
    type: 'login',
    content: '登录系统',
    timestamp: '2025-06-25 12:20:25',
    ip: '192.168.1.1',
    device: 'Chrome / Windows'
  },
  {
    id: 2,
    type: 'operation',
    content: '修改个人资料',
    timestamp: '2025-06-25 11:30:00',
    ip: '192.168.1.1',
    device: 'Chrome / Windows'
  },
  {
    id: 3,
    type: 'login',
    content: '登录系统',
    timestamp: '2025-06-24 09:15:00',
    ip: '192.168.1.1',
    device: 'Chrome / Windows'
  }
]);

// 日志类型过滤
const logType = ref('all');
const filteredLogs = computed(() => {
  if (logType.value === 'all') return logs.value;
  return logs.value.filter(log => log.type === logType.value);
});

// 编辑表单数据
const showEditDialog = ref(false);
const editData = ref({
  name: userInfo.value.name,
  email: userInfo.value.email,
  phone: userInfo.value.phone,
  avatar: userInfo.value.avatar
});

// 修改密码数据
const showPasswordDialog = ref(false);
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单校验规则
const editRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordData.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 保存个人资料
const handleSaveProfile = async () => {
  try {
    // 这里添加保存资料的逻辑
    Object.assign(userInfo.value, editData.value);
    ElMessage.success('保存成功');
    showEditDialog.value = false;
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

// 修改密码
const handleChangePassword = async () => {
  try {
    // 这里添加修改密码的逻辑
    ElMessage.success('密码修改成功');
    showPasswordDialog.value = false;
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    ElMessage.error('密码修改失败');
  }
};

// 上传头像前的处理
const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 加载更多日志
const hasMoreLogs = ref(true);
const loadMoreLogs = () => {
  // 这里添加加载更多日志的逻辑
};

// 获取日志类型样式
const getLogType = (type) => {
  return {
    login: 'primary',
    operation: 'success'
  }[type] || 'info';
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 20px;

  .profile-card {
    .profile-header {
      text-align: center;
      padding: 20px 0;

      h2 {
        margin: 10px 0 5px;
        font-size: 20px;
      }

      .user-role {
        color: #909399;
        margin: 0;
      }
    }

    .profile-info {
      padding: 20px 0;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        color: #606266;

        .el-icon {
          margin-right: 10px;
        }
      }
    }

    .profile-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .log-meta {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;

    span {
      margin-right: 15px;
    }
  }

  .load-more {
    text-align: center;
    margin-top: 20px;
  }
}

.avatar-uploader {
  text-align: center;

  :deep(.avatar-uploader-icon) {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      border-color: #409EFF;
    }
  }
}

:deep(.el-timeline-item__node--primary) {
  background-color: #409EFF;
}

:deep(.el-timeline-item__node--success) {
  background-color: #67C23A;
}
</style>