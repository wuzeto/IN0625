<template>
  <div class="home">
    <el-row :gutter="20">
      <!-- 数据卡片 -->
      <el-col :span="6" v-for="card in dataCards" :key="card.title">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" :style="{ backgroundColor: card.color }">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">{{ card.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <!-- 修改图表容器部分 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>数据趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>数据分布</span>
            </div>
          </template>
          <div ref="distributionChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新数据列表 -->
    <el-card shadow="hover" class="data-list">
      <template #header>
        <div class="list-header">
          <span>最新数据</span>
          <el-button type="primary" size="small">查看更多</el-button>
        </div>
      </template>
      <el-table :data="latestData" stripe style="width: 100%">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="category" label="类型" />
        <el-table-column prop="value" label="数值" />
        <el-table-column prop="timestamp" label="时间" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" link>详情</el-button>
            <el-button type="primary" link>定位</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import {
  DataLine,
  Location,
  Document,
  Setting
} from '@element-plus/icons-vue';

// 数据卡片
const dataCards = ref([
  {
    title: '总数据量',
    value: '1,234',
    icon: Document,
    color: '#409EFF'
  },
  {
    title: '今日新增',
    value: '56',
    icon: DataLine,
    color: '#67C23A'
  },
  {
    title: '活跃点位',
    value: '89',
    icon: Location,
    color: '#E6A23C'
  },
  {
    title: '系统状态',
    value: '正常',
    icon: Setting,
    color: '#909399'
  }
]);

// 时间范围
const timeRange = ref('week');

// 最新数据
const latestData = ref([
  {
    name: '测试点位1',
    category: '类型A',
    value: 123,
    timestamp: '2025-06-25 12:00:00'
  },
  {
    name: '测试点位2',
    category: '类型B',
    value: 456,
    timestamp: '2025-06-25 11:30:00'
  }
]);

// 图表实例引用
const trendChartRef = ref(null);
const distributionChartRef = ref(null);
let trendChart = null;
let distributionChart = null;

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return;

  trendChart = echarts.init(trendChartRef.value);
  const option = {
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
      data: generateTrendData(),
      areaStyle: {
        opacity: 0.3
      }
    }]
  };

  trendChart.setOption(option);
};

// 初始化分布图表
const initDistributionChart = () => {
  if (!distributionChartRef.value) return;

  distributionChart = echarts.init(distributionChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '数据分布',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 335, name: '类型A' },
        { value: 234, name: '类型B' },
        { value: 158, name: '类型C' },
        { value: 132, name: '类型D' }
      ]
    }]
  };

  distributionChart.setOption(option);
};

// 生成趋势数据
const generateTrendData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 24 * 3600 * 1000);
    data.push([
      time.toISOString(),
      Math.round(Math.random() * 100 + 50)
    ]);
  }
  return data;
};

// 处理窗口大小变化
const handleResize = () => {
  trendChart?.resize();
  distributionChart?.resize();
};

// 监听时间范围变化
watch(timeRange, () => {
  if (trendChart) {
    trendChart.setOption({
      series: [{
        data: generateTrendData()
      }]
    });
  }
});

onMounted(() => {
  // 初始化图表
  nextTick(() => {
    initTrendChart();
    initDistributionChart();
  });

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 销毁图表实例
  trendChart?.dispose();
  distributionChart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.home {
  .data-card {
    display: flex;
    padding: 20px;

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      .el-icon {
        font-size: 24px;
        color: white;
      }
    }

    .card-content {
      flex: 1;

      .card-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .chart-row {
    margin-top: 20px;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-list {
    margin-top: 20px;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>