<template>
  <div class="statistics-component">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="8" v-for="(card, index) in statCards" :key="index">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-card">
            <div class="stat-icon" :style="{ backgroundColor: card.color }">
              <el-icon>
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(card.value) }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 时间趋势图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>数据趋势</span>
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="24h">24小时</el-radio-button>
            <el-radio-button label="7d">7天</el-radio-button>
            <el-radio-button label="30d">30天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" class="chart-container"></div>
    </el-card>

    <!-- 分布统计图 -->
    <el-row :gutter="20" class="distribution-charts">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>类别分布</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>数值分布</span>
            </div>
          </template>
          <div ref="valueChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时数据表格 -->
    <el-card class="data-table">
      <template #header>
        <div class="table-header">
          <span>实时数据</span>
          <div class="table-actions">
            <el-switch
              v-model="autoRefresh"
              active-text="自动刷新"
            />
            <el-button-group>
              <el-button 
                :icon="Refresh"
                circle
                @click="refreshData"
              />
              <el-button 
                :icon="Download"
                circle
                @click="exportData"
              />
            </el-button-group>
          </div>
        </div>
      </template>
      <el-table
        :data="tableData"
        style="width: 100%"
        height="300"
        :loading="loading"
      >
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="value" label="数值" width="100">
          <template #default="{ row }">
            {{ formatNumber(row.value) }}
          </template>
        </el-table-column>
        <el-table-column prop="latitude" label="纬度" width="100">
          <template #default="{ row }">
            {{ formatCoordinate(row.latitude, 'N') }}
          </template>
        </el-table-column>
        <el-table-column prop="longitude" label="经度" width="100">
          <template #default="{ row }">
            {{ formatCoordinate(row.longitude, 'E') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="locatePoint(row)"
            >
              定位
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { Refresh, Download } from '@element-plus/icons-vue';
import { useDataStore } from '../stores/data';
import { formatDate, formatNumber, formatCoordinate } from '../utils/formatters';

const emit = defineEmits(['locate-point']);

// Store
const dataStore = useDataStore();

// 状态
const timeRange = ref('24h');
const autoRefresh = ref(true);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const tableData = ref([]);

// 图表引用
const trendChartRef = ref(null);
const categoryChartRef = ref(null);
const valueChartRef = ref(null);
let trendChart = null;
let categoryChart = null;
let valueChart = null;
let refreshTimer = null;

// 统计卡片数据
const statCards = computed(() => [
  {
    label: '总数据量',
    value: dataStore.totalCount,
    icon: 'DataLine',
    color: '#409EFF'
  },
  {
    label: '今日新增',
    value: dataStore.todayCount,
    icon: 'Plus',
    color: '#67C23A'
  },
  {
    label: '平均值',
    value: dataStore.averageValue,
    icon: 'TrendCharts',
    color: '#E6A23C'
  }
]);

// 初始化
onMounted(async () => {
  initCharts();
  await loadData();
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

// 清理
onUnmounted(() => {
  stopAutoRefresh();
  disposeCharts();
});

// 初始化图表
const initCharts = () => {
  // 趋势图
  trendChart = echarts.init(trendChartRef.value);
  trendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '数据量',
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      },
      data: []
    }]
  });

  // 类别分布图
  categoryChart = echarts.init(categoryChartRef.value);
  categoryChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      data: []
    }]
  });

  // 数值分布图
  valueChart = echarts.init(valueChartRef.value);
  valueChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      data: []
    }]
  });

  // 响应式处理
  window.addEventListener('resize', () => {
    trendChart?.resize();
    categoryChart?.resize();
    valueChart?.resize();
  });
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 加载表格数据
    const { data, total: totalCount } = await dataStore.fetchData({
      page: currentPage.value,
      pageSize: pageSize.value,
      timeRange: timeRange.value
    });
    tableData.value = data;
    total.value = totalCount;

    // 更新图表
    updateCharts();
  } catch (error) {
    ElMessage.error('数据加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 更新图表
const updateCharts = () => {
  // 更新趋势图
  const trendData = dataStore.getTrendData(timeRange.value);
  trendChart?.setOption({
    series: [{
      data: trendData
    }]
  });

  // 更新类别分布图
  const categoryData = dataStore.getCategoryDistribution();
  categoryChart?.setOption({
    series: [{
      data: categoryData
    }]
  });

  // 更新数值分布图
  const valueData = dataStore.getValueDistribution();
  valueChart?.setOption({
    xAxis: {
      data: valueData.labels
    },
    series: [{
      data: valueData.values
    }]
  });
};

// 自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    loadData();
  }, 30000); // 每30秒刷新一次
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 手动刷新
const refreshData = () => {
  loadData();
};

// 导出数据
const exportData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    statistics: dataStore.getStatistics(),
    data: tableData.value
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `statistics-${formatDate(new Date(), 'YYYY-MM-DD-HH-mm')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 定位点
const locatePoint = (point) => {
  emit('locate-point', point);
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadData();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadData();
};

// 监听属性变化
watch([timeRange, autoRefresh], ([newTimeRange, newAutoRefresh]) => {
  loadData();
  if (newAutoRefresh) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});
</script>

<style lang="scss" scoped>
.statistics-component {
  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
      }

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          line-height: 1.2;
        }

        .stat-label {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 300px;
    }
  }

  .data-table {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .table-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }

    .table-footer {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>