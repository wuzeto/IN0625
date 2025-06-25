<template>
  <div class="analysis-page">
    <!-- 顶部数据卡片 -->
    <el-row :gutter="20" class="data-cards">
      <el-col :span="6" v-for="card in dataCards" :key="card.title">
        <div class="cyber-card" :class="card.type">
          <div class="card-content">
            <div class="card-value">{{ card.value }}</div>
            <div class="card-title">{{ card.title }}</div>
          </div>
          <div class="card-icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="cyber-border"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 趋势图 -->
      <el-col :span="16">
        <div class="cyber-panel">
          <div class="panel-header">
            <span>数据趋势分析</span>
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container" ref="trendChartRef"></div>
        </div>
      </el-col>

      <!-- 分布图 -->
      <el-col :span="8">
        <div class="cyber-panel">
          <div class="panel-header">
            <span>类型分布</span>
          </div>
          <div class="chart-container" ref="pieChartRef"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 下部图表 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 地理分布 -->
      <el-col :span="12">
        <div class="cyber-panel">
          <div class="panel-header">
            <span>地理分布热力图</span>
          </div>
          <div class="chart-container" ref="mapChartRef"></div>
        </div>
      </el-col>

      <!-- 3D 柱状图 -->
      <el-col :span="12">
        <div class="cyber-panel">
          <div class="panel-header">
            <span>3D 数据分析</span>
          </div>
          <div class="chart-container" ref="bar3dChartRef"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl';
import {
  DataLine,
  Location,
  Monitor,
  TrendCharts
} from '@element-plus/icons-vue';

// 数据卡片
const dataCards = ref([
  {
    title: '总数据量',
    value: '1,234',
    type: 'primary',
    icon: DataLine
  },
  {
    title: '活跃节点',
    value: '89',
    type: 'success',
    icon: Location
  },
  {
    title: '数据流量',
    value: '256MB',
    type: 'warning',
    icon: TrendCharts
  },
  {
    title: '系统负载',
    value: '45%',
    type: 'info',
    icon: Monitor
  }
]);

// 图表引用
const trendChartRef = ref(null);
const pieChartRef = ref(null);
const mapChartRef = ref(null);
const bar3dChartRef = ref(null);

// 时间范围
const timeRange = ref('week');

// 图表实例
let trendChart = null;
let pieChart = null;
let mapChart = null;
let bar3dChart = null;

// 初始化趋势图
const initTrendChart = () => {
  trendChart = echarts.init(trendChartRef.value);
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '数据趋势',
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      top: 70,
      bottom: 50
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: '#0e6fff'
        }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(14, 111, 255, 0.1)'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#0e6fff'
        }
      }
    },
    series: [{
      name: '数据量',
      type: 'line',
      smooth: true,
      symbolSize: 8,
      data: generateTimeData(),
      lineStyle: {
        width: 3,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0e6fff' },
          { offset: 1, color: '#00ffff' }
        ])
      },
      areaStyle: {
        opacity: 0.3,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0e6fff' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  };
  trendChart.setOption(option);
};

// 初始化饼图
const initPieChart = () => {
  pieChart = echarts.init(pieChartRef.value);
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '类型分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        { value: 435, name: '类型A' },
        { value: 310, name: '类型B' },
        { value: 234, name: '类型C' },
        { value: 155, name: '类型D' }
      ],
      label: {
        color: '#fff'
      },
      itemStyle: {
        borderColor: '#000',
        borderWidth: 2
      }
    }]
  };
  pieChart.setOption(option);
};

// 初始化地图
const initMapChart = () => {
  mapChart = echarts.init(mapChartRef.value);
  const option = {
    backgroundColor: 'transparent',
    geo: {
      map: 'china',
      label: {
        emphasis: {
          show: false
        }
      },
      itemStyle: {
        normal: {
          areaColor: '#0e6fff',
          borderColor: '#00ffff'
        },
        emphasis: {
          areaColor: '#4ab2e5'
        }
      }
    },
    series: [{
      name: '热力数据',
      type: 'scatter',
      coordinateSystem: 'geo',
      data: generateGeoData(),
      symbolSize: function (val) {
        return val[2] / 10;
      },
      label: {
        emphasis: {
          show: false
        }
      },
      itemStyle: {
        normal: {
          color: '#00ffff'
        }
      }
    }]
  };
  mapChart.setOption(option);
};

// 初始化3D柱状图
const initBar3dChart = () => {
  bar3dChart = echarts.init(bar3dChartRef.value);
  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    visualMap: {
      max: 100,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
          '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    xAxis3D: {
      type: 'category',
      data: ['类型A', '类型B', '类型C', '类型D', '类型E']
    },
    yAxis3D: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五']
    },
    zAxis3D: {
      type: 'value'
    },
    grid3D: {
      boxWidth: 200,
      boxHeight: 100,
      boxDepth: 80,
      viewControl: {
        projection: 'perspective'
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      }
    },
    series: [{
      type: 'bar3D',
      data: generate3DData(),
      shading: 'lambert',
      label: {
        show: false
      }
    }]
  };
  bar3dChart.setOption(option);
};

// 生成时间序列数据
const generateTimeData = () => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 100; i++) {
    const time = new Date(now - i * 3600 * 1000);
    data.unshift([
      time,
      Math.round(Math.random() * 100 + 50)
    ]);
  }
  return data;
};

// 生成地理数据
const generateGeoData = () => {
  return [
    { name: '北京', value: [116.46, 39.92, 100] },
    { name: '上海', value: [121.48, 31.22, 80] },
    { name: '广州', value: [113.23, 23.16, 70] },
    { name: '深圳', value: [114.07, 22.62, 60] }
  ];
};

// 生成3D数据
const generate3DData = () => {
  const data = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      data.push([i, j, Math.round(Math.random() * 100)]);
    }
  }
  return data;
};

// 窗口大小变化处理
const handleResize = () => {
  trendChart?.resize();
  pieChart?.resize();
  mapChart?.resize();
  bar3dChart?.resize();
};

// 生命周期钩子
onMounted(() => {
  initTrendChart();
  initPieChart();
  initMapChart();
  initBar3dChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  pieChart?.dispose();
  mapChart?.dispose();
  bar3dChart?.dispose();
});
</script>

<style lang="scss" scoped>
.analysis-page {
  padding: 20px;
  background: linear-gradient(135deg, #0a192f 0%, #20232a 100%);
  min-height: 100%;
  color: #fff;

  .data-cards {
    margin-bottom: 20px;

    .cyber-card {
      background: rgba(14, 111, 255, 0.1);
      border: 1px solid #0e6fff;
      padding: 20px;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
      height: 120px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 0%, rgba(14, 111, 255, 0.1) 100%);
      }

      &.primary { border-color: #0e6fff; }
      &.success { border-color: #67C23A; }
      &.warning { border-color: #E6A23C; }
      &.info { border-color: #909399; }

      .card-content {
        position: relative;
        z-index: 1;

        .card-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
          background: linear-gradient(to right, #fff, #0e6fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .card-title {
          font-size: 14px;
          color: #8c9dad;
        }
      }

      .card-icon {
        font-size: 48px;
        opacity: 0.2;
      }

      .cyber-border {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, transparent, #0e6fff, transparent);
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .cyber-panel {
      background: rgba(14, 111, 255, 0.1);
      border: 1px solid #0e6fff;
      border-radius: 4px;
      padding: 20px;
      height: 400px;
      position: relative;

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(14, 111, 255, 0.3);
        font-size: 16px;
        color: #fff;
      }

      .chart-container {
        height: calc(100% - 60px);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 0%, rgba(14, 111, 255, 0.05) 100%);
        pointer-events: none;
      }
    }
  }
}

// 适配暗色主题
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #0e6fff;
  border-color: #0e6fff;
  box-shadow: -1px 0 0 0 #0e6fff;
}

:deep(.el-radio-button__inner) {
  background: transparent;
  border-color: #0e6fff;
  color: #fff;

  &:hover {
    color: #0e6fff;
  }
}
</style>