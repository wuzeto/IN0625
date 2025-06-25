<template>
  <div class="visualization-container">
    <!-- 左侧控制面板 -->
    <div class="control-panel">
      <el-card class="filter-card">
        <template #header>
          <div class="card-header">
            <span>数据筛选</span>
          </div>
        </template>
        <el-form :model="filterForm" label-width="80px" size="small">
          <el-form-item label="图层">
            <el-select v-model="filterForm.layerId" placeholder="选择图层">
              <el-option v-for="layer in layers" :key="layer.id" :label="layer.name" :value="layer.id"/>
            </el-select>
          </el-form-item>
          <el-form-item label="区域">
            <el-select v-model="filterForm.regionId" placeholder="选择区域">
              <el-option v-for="region in regions" :key="region.id" :label="region.name" :value="region.id"/>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="applyFilter">应用筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 统计数据卡片 -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>统计数据</span>
            <el-button type="text" @click="exportData">导出数据</el-button>
          </div>
        </template>
        <el-row :gutter="20" class="stats-content">
          <el-col :span="8">
            <div class="stat-item">
              <span class="label">总点数</span>
              <span class="value">{{ totalDisplay }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <span class="label">平均值</span>
              <span class="value">{{ averageDisplay }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <span class="label">最大值</span>
              <span class="value">{{ maxDisplay }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 地图主体 -->
    <div class="map-container">
      <div id="map" ref="mapRef"></div>
      <div class="map-controls">
        <el-radio-group v-model="baseMap" size="small" @change="changeBaseMap">
          <el-radio-button label="osm">OpenStreetMap</el-radio-button>
          <el-radio-button label="cartodb">CartoDB</el-radio-button>
          <el-radio-button label="esri">卫星图</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="visualType" size="small" class="visual-type">
          <el-radio-button label="heat">热力图</el-radio-button>
          <el-radio-button label="cluster">聚合点</el-radio-button>
          <el-radio-button label="marker">标记点</el-radio-button>
        </el-radio-group>
        <div class="time-range">
          <el-date-picker
              v-model="startTime"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              @change="onTimeChange"
          />
          <el-date-picker
              v-model="endTime"
              type="date"
              placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="onTimeChange"
          />
        </div>
      </div>
    </div>

    <!-- 右侧图表面板 -->
    <div class="chart-panel">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>时间序列分析</span>
            <el-select v-model="timeInterval" size="small" style="width: 100px">
              <el-option label="日" value="day"/>
              <el-option label="周" value="week"/>
              <el-option label="月" value="month"/>
            </el-select>
          </div>
        </template>
        <div id="timeSeriesChart" ref="timeSeriesRef" class="chart"></div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>区域分布</span>
            <el-radio-group v-model="chartType" size="small">
              <el-radio-button label="pie">饼图</el-radio-button>
              <el-radio-button label="bar">柱状图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div id="regionDistChart" ref="regionDistRef" class="chart"></div>
      </el-card>
    </div>

    <!-- 导出对话框 -->
    <el-dialog title="导出数据" v-model="exportDialogVisible" width="30%">
      <el-form :model="exportForm" label-width="80px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useTransition } from '@vueuse/core'
import { computed } from 'vue'

export default {
  name: 'MapVisualization',
  setup() {
    const stats = reactive({
      total: 0,
      average: 0,
      max: 0
    })

    const totalDisplay = useTransition(computed(() => stats.total))
    const averageDisplay = useTransition(computed(() => stats.average))
    const maxDisplay = useTransition(computed(() => stats.max))

    return {
      stats,
      totalDisplay: computed(() => Math.round(totalDisplay.value)),
      averageDisplay: computed(() => averageDisplay.value.toFixed(2)),
      maxDisplay: computed(() => Math.round(maxDisplay.value))
    }
  },
  async mounted() {
    await this.initData()
    this.initMap()
    this.initCharts()
    this.loadMapData()
  },
  methods: {
    // 方法保持不变，使用合并后的数据结构
    async initData() { /* ... */ },
    initMap() { /* ... */ },
    initCharts() { /* ... */ },
    async loadMapData() { /* ... */ },
    updateMapVisualization() { /* ... */ },
    showHeatmap() { /* ... */ },
    showCluster() { /* ... */ },
    showMarkers() { /* ... */ },
    changeBaseMap(value) { /* ... */ },
    applyFilter() { /* ... */ },
    resetFilter() { /* ... */ },
    exportData() { /* ... */ },
    async confirmExport() { /* ... */ },
    async loadHeatmapData() { /* ... */ },
    onTimeChange() {
      this.loadHeatmapData()
    }
  }
}
</script>

<style scoped>
.visualization-container {
  display: grid;
  grid-template-columns: 300px 1fr 400px;
  gap: 16px;
  height: 100vh;
  padding: 16px;
  background-color: #f0f2f5;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.map-container #map {
  height: 100%;
  width: 100%;
}

.chart-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card {
  flex: 1;
}

.chart {
  height: calc(100% - 40px);
  min-height: 300px;
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.time-range {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.visual-type {
  margin-top: 8px;
}

.stats-content {
  text-align: center;
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-item .label {
  font-size: 14px;
  color: #666;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}
</style>