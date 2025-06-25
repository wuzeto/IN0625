<template>
  <el-dialog
    :title="isEdit ? '编辑图层' : '新建图层'"
    v-model="dialogVisible"
    width="50%"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="layerForm"
      :rules="rules"
      label-width="100px"
    >
      <!-- 基本信息 -->
      <el-form-item label="图层名称" prop="name">
        <el-input v-model="layerForm.name" placeholder="请输入图层名称" />
      </el-form-item>

      <el-form-item label="图层类型" prop="type">
        <el-select 
          v-model="layerForm.type"
          placeholder="请选择图层类型"
          :disabled="isEdit"
        >
          <el-option label="点图层" value="point" />
          <el-option label="热力图" value="heatmap" />
          <el-option label="区域图层" value="region" />
        </el-select>
      </el-form-item>

      <!-- 点图层设置 -->
      <template v-if="layerForm.type === 'point'">
        <el-form-item label="点样式">
          <el-collapse>
            <el-collapse-item title="样式设置">
              <el-form-item label="图标大小">
                <el-slider 
                  v-model="layerForm.style.iconSize" 
                  :min="10"
                  :max="50"
                />
              </el-form-item>
              <el-form-item label="图标颜色">
                <el-color-picker v-model="layerForm.style.iconColor" />
              </el-form-item>
              <el-form-item label="聚合开启">
                <el-switch v-model="layerForm.style.cluster" />
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </template>

      <!-- 热力图设置 -->
      <template v-if="layerForm.type === 'heatmap'">
        <el-form-item label="热力图设置">
          <el-collapse>
            <el-collapse-item title="热力图参数">
              <HeatmapSettings v-model="layerForm.style.heatmap" />
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </template>

      <!-- 区域图层设置 -->
      <template v-if="layerForm.type === 'region'">
        <el-form-item label="区域样式">
          <el-collapse>
            <el-collapse-item title="样式设置">
              <el-form-item label="填充颜色">
                <el-color-picker 
                  v-model="layerForm.style.fillColor"
                  show-alpha
                />
              </el-form-item>
              <el-form-item label="边框颜色">
                <el-color-picker 
                  v-model="layerForm.style.strokeColor"
                />
              </el-form-item>
              <el-form-item label="边框宽度">
                <el-slider 
                  v-model="layerForm.style.strokeWidth"
                  :min="1"
                  :max="5"
                />
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </template>

      <!-- 高级设置 -->
      <el-form-item label="高级设置">
        <el-collapse>
          <el-collapse-item title="数据刷新">
            <el-form-item label="自动刷新">
              <el-switch v-model="layerForm.settings.autoRefresh" />
            </el-form-item>
            <el-form-item 
              label="刷新间隔"
              v-if="layerForm.settings.autoRefresh"
            >
              <el-input-number 
                v-model="layerForm.settings.refreshInterval"
                :min="5"
                :max="3600"
                :step="5"
              /> 秒
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="数据过滤">
            <el-form-item label="时间范围">
              <el-select v-model="layerForm.settings.timeFilter">
                <el-option label="全部数据" value="all" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
              </el-select>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import HeatmapSettings from './HeatmapSettings.vue';

const props = defineProps({
  visible: Boolean,
  layer: Object
});

const emit = defineEmits(['update:visible', 'submit']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const isEdit = computed(() => !!props.layer);

const formRef = ref(null);

// 表单数据
const defaultForm = {
  name: '',
  type: 'point',
  style: {
    // 点图层默认样式
    iconSize: 25,
    iconColor: '#409EFF',
    cluster: true,
    // 热力图默认样式
    heatmap: {
      radius: 25,
      blur: 15,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    },
    // 区域图层默认样式
    fillColor: 'rgba(64, 158, 255, 0.2)',
    strokeColor: '#409EFF',
    strokeWidth: 2
  },
  settings: {
    autoRefresh: false,
    refreshInterval: 30,
    timeFilter: 'all'
  }
};

const layerForm = ref({ ...defaultForm });

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入图层名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择图层类型', trigger: 'change' }
  ]
};

// 监听编辑状态
watch(() => props.layer, (newLayer) => {
  if (newLayer) {
    layerForm.value = {
      ...defaultForm,
      ...newLayer,
      style: {
        ...defaultForm.style,
        ...newLayer.style
      },
      settings: {
        ...defaultForm.settings,
        ...newLayer.settings
      }
    };
  } else {
    layerForm.value = { ...defaultForm };
  }
}, { immediate: true });

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      emit('submit', { ...layerForm.value });
      handleClose();
    }
  });
};

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields();
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
.el-collapse {
  border: none;
}

:deep(.el-collapse-item__header) {
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>