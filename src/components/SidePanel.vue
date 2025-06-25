<template>
  <div class="side-panel">
    <!-- 图层管理 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item title="图层管理" name="layers">
        <LayerList />
      </el-collapse-item>
      
      <!-- 数据筛选 -->
      <el-collapse-item title="数据筛选" name="filters">
        <DataFilter @filter-change="handleFilterChange" />
      </el-collapse-item>
      
      <!-- 统计信息 -->
      <el-collapse-item title="统计信息" name="stats">
        <Statistics :data="statisticsData" />
      </el-collapse-item>
    </el-collapse>

    <!-- 底部工具栏 -->
    <div class="bottom-toolbar">
      <el-button-group>
        <el-button type="primary" @click="addNewData">
          <el-icon><Plus /></el-icon> 添加数据
        </el-button>
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </el-button-group>
    </div>

    <!-- 添加数据对话框 -->
    <AddDataDialog
      v-model:visible="showAddDialog"
      @submit="handleDataSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Download } from '@element-plus/icons-vue';
import { useLayerStore } from '../stores/layer';
import { useDataStore } from '../stores/data';
import LayerList from './LayerList.vue';
import DataFilter from './DataFilter.vue';
import Statistics from './Statistics.vue';
import AddDataDialog from './AddDataDialog.vue';

const activeCollapse = ref(['layers']);
const showAddDialog = ref(false);
const layerStore = useLayerStore();
const dataStore = useDataStore();
const statisticsData = ref({});

onMounted(async () => {
  await updateStatistics();
});

const updateStatistics = async () => {
  const stats = await dataStore.fetchStatistics();
  statisticsData.value = stats;
};

const handleFilterChange = (filters) => {
  dataStore.applyFilters(filters);
};

const addNewData = () => {
  showAddDialog.value = true;
};

const handleDataSubmit = async (data) => {
  try {
    await dataStore.addData(data);
    showAddDialog.value = false;
    ElMessage.success('数据添加成功');
    updateStatistics();
  } catch (error) {
    ElMessage.error('添加失败：' + error.message);
  }
};

const exportData = async () => {
  try {
    const data = await dataStore.exportCurrentView();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geo-data-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('导出失败：' + error.message);
  }
};
</script>

<style lang="scss" scoped>
.side-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .el-collapse {
    flex: 1;
    overflow-y: auto;
  }

  .bottom-toolbar {
    padding: 20px 0;
    border-top: 1px solid #dcdfe6;
    display: flex;
    justify-content: center;
  }
}
</style>