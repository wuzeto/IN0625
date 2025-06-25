<template>
  <div class="data-panel" v-show="visible">
    <el-card>
      <template #header>
        <div class="panel-header">
          <span>数据统计</span>
          <el-button type="text" @click="$emit('close')">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      
      <div class="statistics">
        <Statistics :data="statisticsData" />
      </div>
      
      <div class="charts">
        <div id="timeChart" style="height: 300px"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';
import Statistics from './Statistics.vue';
import * as echarts from 'echarts';
import { useDataStore } from '../stores/data';

const props = defineProps({
  selectedPoint: Object
});

const visible = ref(false);
const dataStore = useDataStore();
let timeChart = null;

onMounted(() => {
  initCharts();
});

const initCharts = () => {
  timeChart = echarts.init(document.getElementById('timeChart'));
  updateTimeChart();
};

const updateTimeChart = () => {
  if (!timeChart) return;
  
  const option = {
    title: { text: '时间分布' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    series: [{
      data: dataStore.getTimeSeriesData(),
      type: 'line'
    }]
  };
  
  timeChart.setOption(option);
};

watch(() => props.selectedPoint, (newVal) => {
  visible.value = !!newVal;
  if (newVal) {
    updateTimeChart();
  }
});
</script>

<style scoped>
.data-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 400px;
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics {
  margin-bottom: 20px;
}
</style>