<template>
  <div class="layer-list">
    <el-table
      :data="layers"
      style="width: 100%"
      size="small"
      row-key="id"
    >
      <!-- 可见性切换 -->
      <el-table-column width="50">
        <template #default="{ row }">
          <el-switch
            v-model="row.visible"
            @change="toggleLayerVisibility(row)"
          />
        </template>
      </el-table-column>

      <!-- 图层名称 -->
      <el-table-column prop="name" label="名称">
        <template #default="{ row }">
          <div class="layer-name">
            <el-icon :class="getLayerIcon(row.type)" />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 操作按钮 -->
      <el-table-column width="120">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              size="small"
              @click="editLayer(row)"
              :icon="Edit"
            />
            <el-button
              size="small"
              @click="showLayerSettings(row)"
              :icon="Setting"
            />
            <el-button
              size="small"
              type="danger"
              @click="deleteLayer(row)"
              :icon="Delete"
            />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加图层按钮 -->
    <div class="add-layer">
      <el-button type="primary" @click="showAddLayer">
        <el-icon><Plus /></el-icon> 添加图层
      </el-button>
    </div>

    <!-- 图层编辑对话框 -->
    <LayerDialog
      v-model:visible="dialogVisible"
      :layer="currentLayer"
      @submit="handleLayerSubmit"
    />

    <!-- 图层设置对话框 -->
    <LayerSettings
      v-model:visible="settingsVisible"
      :layer="currentLayer"
      @update="handleLayerUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Edit, Setting, Delete, Plus } from '@element-plus/icons-vue';
import { useLayerStore } from '../stores/layer';
import LayerDialog from './LayerDialog.vue';
import LayerSettings from './LayerSettings.vue';
import { ElMessageBox } from 'element-plus';

const layerStore = useLayerStore();
const layers = computed(() => layerStore.layers);
const dialogVisible = ref(false);
const settingsVisible = ref(false);
const currentLayer = ref(null);

const getLayerIcon = (type) => {
  const icons = {
    point: 'location',
    heatmap: 'hot-water',
    region: 'position'
  };
  return icons[type] || 'layer';
};

const toggleLayerVisibility = async (layer) => {
  try {
    await layerStore.toggleLayerVisibility(layer.id);
  } catch (error) {
    ElMessage.error('切换图层可见性失败');
  }
};

const showAddLayer = () => {
  currentLayer.value = null;
  dialogVisible.value = true;
};

const editLayer = (layer) => {
  currentLayer.value = { ...layer };
  dialogVisible.value = true;
};

const showLayerSettings = (layer) => {
  currentLayer.value = { ...layer };
  settingsVisible.value = true;
};

const deleteLayer = async (layer) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该图层吗？这将同时删除图层上的所有数据。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await layerStore.deleteLayer(layer.id);
    ElMessage.success('图层删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message);
    }
  }
};

const handleLayerSubmit = async (layerData) => {
  try {
    if (currentLayer.value) {
      await layerStore.updateLayer(currentLayer.value.id, layerData);
      ElMessage.success('图层更新成功');
    } else {
      await layerStore.createLayer(layerData);
      ElMessage.success('图层创建成功');
    }
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error('操作失败：' + error.message);
  }
};

const handleLayerUpdate = async (settings) => {
  try {
    await layerStore.updateLayerSettings(currentLayer.value.id, settings);
    ElMessage.success('设置已更新');
    settingsVisible.value = false;
  } catch (error) {
    ElMessage.error('更新设置失败：' + error.message);
  }
};
</script>

<style lang="scss" scoped>
.layer-list {
  .layer-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .add-layer {
    margin-top: 16px;
    text-align: center;
  }
}
</style>