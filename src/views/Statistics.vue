<template>
  <div>
    <h2>统计报表</h2>
    <table border="1">
      <thead>
        <tr>
          <th>区域</th>
          <th>图层</th>
          <th>总和</th>
          <th>平均值</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in stats" :key="index">
          <td>{{ row.region }}</td>
          <td>{{ row.layer }}</td>
          <td>{{ row.total }}</td>
          <td>{{ row.average }}</td>
        </tr>
      </tbody>
    </table>
    <button @click="exportToCSV">导出 CSV</button>
    <button @click="printTable">打印预览</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: [
        { region: '华东', layer: '空气质量', total: 1000, average: 50 },
        { region: '华北', layer: '人口密度', total: 2000, average: 100 }
      ]
    };
  },
  methods: {
    exportToCSV() {
      let csvContent = 'Region,Layer,Total,Average\n';
      this.stats.forEach(row => {
        csvContent += `${row.region},${row.layer},${row.total},${row.average}\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'statistics.csv';
      link.click();
    },
    printTable() {
      window.print();
    }
  }
};
</script>
