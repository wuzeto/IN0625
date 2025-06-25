<template>
  <div>
    <select v-model="chartType">
      <option value="bar">柱状图</option>
      <option value="line">折线图</option>
      <option value="pie">饼图</option>
    </select>
    <button @click="exportChart">导出图表</button>
    <div ref="chart" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      chartType: 'bar',
      chartData: {
        xAxis: ['华东', '华北', '华南', '华中'],
        series: [{ data: [78, 65, 82, 70] }]
      }
    };
  },
  mounted() {
    this.drawChart();
  },
  watch: {
    chartType() {
      this.drawChart();
    }
  },
  methods: {
    drawChart() {
      if (this.chart) {
        this.chart.dispose(); // 销毁旧实例
      }

      this.chart = echarts.init(this.$refs.chart);
      const option = {
        title: { text: '区域数据对比' },
        tooltip: {},
        xAxis: { data: this.chartData.xAxis },
        yAxis: { type: 'value' },
        series: [{
          name: '平均值',
          type: this.chartType,
          data: this.chartData.series[0].data
        }]
      };
      this.chart.setOption(option);
    },
    exportChart() {
      const imageUrl = this.chart.getDataURL({ type: 'png' });
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'chart.png';
      link.click();
    }
  }
};
</script>
