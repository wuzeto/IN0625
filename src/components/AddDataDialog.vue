<template>
  <el-dialog
    title="添加数据"
    v-model="dialogVisible"
    width="60%"
    :before-close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <!-- 手动添加 -->
      <el-tab-pane label="手动添加" name="manual">
        <el-form
          ref="manualFormRef"
          :model="manualForm"
          :rules="manualRules"
          label-width="100px"
        >
          <el-form-item label="选择图层" prop="layerId">
            <el-select 
              v-model="manualForm.layerId"
              placeholder="请选择图层"
            >
              <el-option
                v-for="layer in availableLayers"
                :key="layer.id"
                :label="layer.name"
                :value="layer.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="名称" prop="name">
            <el-input v-model="manualForm.name" />
          </el-form-item>

          <el-form-item label="位置">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item prop="latitude">
                  <el-input
                    v-model.number="manualForm.latitude"
                    placeholder="纬度"
                  >
                    <template #append>°N</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="longitude">
                  <el-input
                    v-model.number="manualForm.longitude"
                    placeholder="经度"
                  >
                    <template #append>°E</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-button 
              type="primary" 
              link
              @click="pickLocation"
            >
              在地图上选择位置
            </el-button>
          </el-form-item>

          <el-form-item label="数值" prop="value">
            <el-input-number 
              v-model="manualForm.value"
              :precision="2"
              :step="0.1"
            />
          </el-form-item>

          <el-form-item label="描述">
            <el-input
              v-model="manualForm.description"
              type="textarea"
              rows="3"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 文件导入 -->
      <el-tab-pane label="文件导入" name="file">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".csv,.json,.geojson"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 CSV、JSON、GeoJSON 格式文件
            </div>
          </template>
        </el-upload>

        <el-form v-if="fileForm.file" style="margin-top: 20px">
          <el-form-item label="选择图层">
            <el-select v-model="fileForm.layerId">
              <el-option
                v-for="layer in availableLayers"
                :key="layer.id"
                :label="layer.name"
                :value="layer.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="数据预览">
            <el-table
              :data="previewData"
              height="300"
              border
              style="width: 100%"
            >
              <el-table-column
                v-for="(col, index) in previewColumns"
                :key="index"
                :prop="col"
                :label="col"
              />
            </el-table>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitData"
          :loading="submitting"
        >
          确定
        </el-button>
      </span>
    </template>

    <!-- 位置选择地图对话框 -->
    <el-dialog
      v-model="showLocationPicker"
      title="选择位置"
      width="80%"
      append-to-body
    >
      <div style="height: 500px">
        <LocationPicker
          v-if="showLocationPicker"
          @location-selected="handleLocationSelected"
        />
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { useLayerStore } from '../stores/layer';
import { useDataStore } from '../stores/data';
import LocationPicker from './LocationPicker.vue';
import { parseCSV, parseJSON } from '../utils/fileParser';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'submit']);

const layerStore = useLayerStore();
const dataStore = useDataStore();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const activeTab = ref('manual');
const manualFormRef = ref(null);
const submitting = ref(false);
const showLocationPicker = ref(false);

// 可用图层列表
const availableLayers = computed(() => {
  return layerStore.layers.filter(l => l.type !== 'heatmap');
});

// 手动添加表单
const manualForm = ref({
  layerId: '',
  name: '',
  latitude: null,
  longitude: null,
  value: 0,
  description: ''
});

// 文件导入表单
const fileForm = ref({
  file: null,
  layerId: ''
});

// 预览数据
const previewData = ref([]);
const previewColumns = ref([]);

// 表单验证规则
const manualRules = {
  layerId: [
    { required: true, message: '请选择图层', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  latitude: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    { type: 'number', message: '纬度必须为数字', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value < -90 || value > 90) {
          callback(new Error('纬度范围为-90°到90°'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  longitude: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    { type: 'number', message: '经度必须为数字', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value < -180 || value > 180) {
          callback(new Error('经度范围为-180°到180°'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 处理文件改变
const handleFileChange = async (file) => {
  if (!file) return;
  
  fileForm.value.file = file;
  
  try {
    let data;
    if (file.name.endsWith('.csv')) {
      data = await parseCSV(file.raw);
    } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
      data = await parseJSON(file.raw);
    }
    
    if (data && data.length > 0) {
      previewData.value = data.slice(0, 10);
      previewColumns.value = Object.keys(data[0]);
    }
  } catch (error) {
    ElMessage.error('文件解析失败：' + error.message);
  }
};

// 打开位置选择器
const pickLocation = () => {
  showLocationPicker.value = true;
};

// 处理位置选择
const handleLocationSelected = (location) => {
  manualForm.value.latitude = location.lat;
  manualForm.value.longitude = location.lng;
  showLocationPicker.value = false;
};

// 提交数据
const submitData = async () => {
  if (activeTab.value === 'manual') {
    await submitManualData();
  } else {
    await submitFileData();
  }
};

// 提交手动添加的数据
const submitManualData = async () => {
  if (!manualFormRef.value) return;
  
  try {
    await manualFormRef.value.validate();
    submitting.value = true;
    
    await dataStore.addPoint({
      ...manualForm.value,
      timestamp: new Date().toISOString()
    });
    
    ElMessage.success('数据添加成功');
    handleClose();
  } catch (error) {
    ElMessage.error('添加失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 提交文件数据
const submitFileData = async () => {
  if (!fileForm.value.file || !fileForm.value.layerId) {
    ElMessage.warning('请选择文件和目标图层');
    return;
  }
  
  try {
    submitting.value = true;
    await dataStore.importData(fileForm.value.file, fileForm.value.layerId);
    ElMessage.success('数据导入成功');
    handleClose();
  } catch (error) {
    ElMessage.error('导入失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  activeTab.value = 'manual';
  manualFormRef.value?.resetFields();
  fileForm.value = { file: null, layerId: '' };
  previewData.value = [];
  previewColumns.value = [];
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
.upload-demo {
  text-align: center;
  
  .el-upload {
    width: 100%;
  }
  
  .el-upload-dragger {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>