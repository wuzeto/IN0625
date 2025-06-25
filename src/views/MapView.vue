<template>
  <div class="visualization-container">
    <!-- 地图主体 -->
    <div class="map-container">
      <div id="map" ref="mapRef"></div>
      <div class="map-controls">
        <el-select v-model="baseMap" @change="changeBaseMap" size="small">
          <el-option label="OpenStreetMap" value="osm"/>
          <el-option label="CartoDB Light" value="cartodb"/>
          <el-option label="ESRI Satellite" value="esri"/>
        </el-select>
      </div>
    </div>

    <!-- 数据分析面板 -->
    <div class="analysis-panel">
      <!-- 时间序列图 -->
      <div class="chart-container">
        <div id="timeSeriesChart" ref="timeSeriesRef"></div>
      </div>

      <!-- 区域分布图 -->
      <div class="chart-container">
        <div id="regionDistChart" ref="regionDistRef"></div>
      </div>

      <!-- 统计数据卡片 -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>统计数据</span>
            <el-button type="text" @click="exportData">导出数据</el-button>
          </div>
        </template>
        <div class="stats-content">
          <div class="stat-item">
            <span class="label">总点数</span>
            <span class="value">{{ stats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="label">平均值</span>
            <span class="value">{{ stats.average.toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">最大值</span>
            <span class="value">{{ stats.max }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import * as echarts from 'echarts'
import axios from 'axios'
import { ref, onMounted, reactive } from 'vue'

export default {
  name: 'MapVisualization',
  setup() {
    const mapRef = ref(null)
    const timeSeriesRef = ref(null)
    const regionDistRef = ref(null)

    const map = ref(null)
    const baseMap = ref('osm')
    const baseMapLayers = reactive({
      osm: null,
      cartodb: null,
      esri: null
    })

    const stats = reactive({
      total: 0,
      average: 0,
      max: 0
    })

    // 初始化地图
    const initMap = () => {
      map.value = L.map(mapRef.value).setView([35.0, 105.0], 4)

      // 配置底图
      baseMapLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      baseMapLayers.cartodb = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png')
      baseMapLayers.esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')

      baseMapLayers.osm.addTo(map.value)
    }

    // 初始化图表
    const initCharts = () => {
      const timeSeriesChart = echarts.init(timeSeriesRef.value)
      const regionDistChart = echarts.init(regionDistRef.value)

      // 配置时间序列图
      timeSeriesChart.setOption({
        title: { text: '时间序列分析' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'time' },
        yAxis: { type: 'value' },
        series: [{
          name: '数值',
          type: 'line',
          smooth: true,
          data: []
        }]
      })

      // 配置区域分布图
      regionDistChart.setOption({
        title: { text: '区域分布' },
        tooltip: { trigger: 'item' },
        series: [{
          name: '区域分布',
          type: 'pie',
          radius: '50%',
          data: []
        }]
      })
    }

    // 加载数据
    const loadData = async () => {
      try {
        // 加载点位数据
        const pointsResponse = await axios.get('/api/geo-points')
        const points = pointsResponse.data

        // 更新统计数据
        stats.total = points.length
        stats.average = points.reduce((sum, p) => sum + p.value, 0) / points.length
        stats.max = Math.max(...points.map(p => p.value))

        // 更新地图
        updateMapVisualization(points)

        // 更新图表
        updateCharts(points)
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }

    // 更新地图可视化
    const updateMapVisualization = (points) => {
      // 清除现有图层
      map.value.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          map.value.removeLayer(layer)
        }
      })

      // 添加热力图
      const heatData = points.map(p => [p.lat, p.lon, p.value])
      L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10
      }).addTo(map.value)

      // 添加聚合点
      const markers = L.markerClusterGroup()
      points.forEach(p => {
        const marker = L.marker([p.lat, p.lon])
            .bindPopup(`值: ${p.value}<br>时间: ${p.point_time}`)
        markers.addLayer(marker)
      })
      map.value.addLayer(markers)
    }

    // 更新图表
    const updateCharts = (points) => {
      // 更新时间序列图
      const timeSeriesData = points.map(p => [p.point_time, p.value])
      const timeSeriesChart = echarts.getInstanceByDom(timeSeriesRef.value)
      timeSeriesChart.setOption({
        series: [{
          data: timeSeriesData
        }]
      })

      // 更新区域分布图
      const regionData = {}
      points.forEach(p => {
        if (!regionData[p.region_name]) {
          regionData[p.region_name] = 0
        }
        regionData[p.region_name]++
      })

      const pieData = Object.entries(regionData).map(([name, value]) => ({
        name,
        value
      }))

      const regionDistChart = echarts.getInstanceByDom(regionDistRef.value)
      regionDistChart.setOption({
        series: [{
          data: pieData
        }]
      })
    }

    // 切换底图
    const changeBaseMap = (value) => {
      Object.values(baseMapLayers).forEach(layer => {
        if (layer) {
          map.value.removeLayer(layer)
        }
      })
      baseMapLayers[value].addTo(map.value)
    }

    // 导出数据
    const exportData = () => {
      // 实现导出功能
    }

    onMounted(() => {
      initMap()
      initCharts()
      loadData()

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        const charts = [
          echarts.getInstanceByDom(timeSeriesRef.value),
          echarts.getInstanceByDom(regionDistRef.value)
        ]
        charts.forEach(chart => chart?.resize())
      })
    })

    return {
      mapRef,
      timeSeriesRef,
      regionDistRef,
      baseMap,
      stats,
      changeBaseMap,
      exportData
    }
  }
}
</script>

<style scoped>
.visualization-container {
  display: flex;
  height: 100vh;
  padding: 16px;
  gap: 16px;
}

.map-container {
  flex: 2;
  position: relative;
}

#map {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.analysis-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-container {
  height: 300px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-card {
  margin-top: auto;
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>