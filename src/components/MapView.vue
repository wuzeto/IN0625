<template>
  <div ref="mapContainer" class="map-container">
    <!-- 工具提示 -->
    <div v-if="currentTool" class="tool-tip" :class="currentTool">
      <template v-if="currentTool === 'measure'">
        <p>点击地图开始测量距离</p>
        <p>双击结束测量</p>
      </template>
      <template v-else-if="currentTool === 'draw'">
        <p>点击地图开始绘制</p>
        <p>双击结束绘制</p>
      </template>
    </div>

    <!-- 图层控制 -->
    <div class="layer-control">
      <el-button-group>
        <el-tooltip
            v-for="layer in layers"
            :key="layer.id"
            :content="layer.name"
            placement="left"
        >
          <el-button
              :type="layer.visible ? 'primary' : 'default'"
              @click="toggleLayer(layer)"
          >
            <el-icon>
              <component :is="getLayerIcon(layer.type)" />
            </el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>

    <!-- 坐标信息 -->
    <div class="coordinate-info" v-if="currentCoordinate">
      <p>经度: {{ formatCoordinate(currentCoordinate.lng, 'E') }}</p>
      <p>纬度: {{ formatCoordinate(currentCoordinate.lat, 'N') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLayerStore } from '../stores/layer';
import { useDataStore } from '../stores/data';
import {
  Location, MapLocation, Histogram, DataLine
} from '@element-plus/icons-vue';
import { formatCoordinate } from '../utils/formatters';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';
import { chunk } from 'lodash-es';

// 组件引用和状态管理
const mapViewRef = ref(null);

const markerClusterGroup = ref(null);
const loading = ref(false);

// 点位分组大小
const CHUNK_SIZE = 1000;

// 初始化地图
onMounted(async () => {
  // 创建地图实例
  map.value = L.map(mapContainer.value, {
    center: [35.86166, 104.195397],
    zoom: 4,
    preferCanvas: true // 使用 Canvas 渲染提高性能
  });

  // 添加底图
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value);

  // 初始化点聚合组
  markerClusterGroup.value = L.markerClusterGroup({
    chunkedLoading: true,
    chunkInterval: 50, // 每50ms处理一批点位
    chunkDelay: 10,   // 批次间隔10ms
    maxClusterRadius: 80 // 聚合半径
  });

  map.value.addLayer(markerClusterGroup.value);

  // 加载数据
  await loadPoints();
});

// 加载点位数据
const loadPoints = async () => {
  loading.value = true;
  try {
    await dataStore.fetchPoints();

    // 清除现有标记
    markerClusterGroup.value.clearLayers();

    // 分批处理点位
    const pointChunks = chunk(dataStore.points, CHUNK_SIZE);

    for (const chunk of pointChunks) {
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          addPointsToMap(chunk);
          resolve();
        });
      });
    }
  } catch (error) {
    console.error('Failed to load points:', error);
    ElMessage.error('加载点位数据失败');
  } finally {
    loading.value = false;
  }
};

// 添加点位到地图
const addPointsToMap = (points) => {
  const markers = points.map(point => {
    const marker = L.marker([point.latitude, point.longitude], {
      icon: createCustomIcon(point)
    });

    // 使用字符串模板而不是DOM操作来创建popup内容
    const popupContent = `
      <div class="popup-content">
        <h3>${point.name}</h3>
        <p>类型: ${point.category}</p>
        <p>数值: ${point.value.toFixed(2)}</p>
        <p>时间: ${new Date(point.timestamp).toLocaleString()}</p>
      </div>
    `;

    marker.bindPopup(popupContent);
    return marker;
  });

  markerClusterGroup.value.addLayers(markers);
};

// 优化的图标创建函数
const createCustomIcon = (point) => {
  // 缓存相同样式的图标
  const cacheKey = `${point.category}-${point.value}`;
  if (!iconCache.has(cacheKey)) {
    iconCache.set(cacheKey, L.divIcon({
      className: `custom-marker-container category-${point.category.toLowerCase()}`,
      html: `<div class="custom-marker"></div>`,
      iconSize: [25, 25]
    }));
  }
  return iconCache.get(cacheKey);
};

// 图标缓存
const iconCache = new Map();

// 清理函数
onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
    iconCache.clear();
  }
});
// 组件引用
const mapContainer = ref(null);

const layers = ref([]);
const currentTool = ref(null);
const currentCoordinate = ref(null);

// Store
const layerStore = useLayerStore();
const dataStore = useDataStore();

// 图层组
const layerGroups = {
  points: L.markerClusterGroup(),
  heatmap: L.heatLayer([], { radius: 25, blur: 15 }),
  regions: L.featureGroup()
};

// 工具状态
const measureTool = {
  points: [],
  line: null,
  active: false
};

const drawTool = {
  points: [],
  shape: null,
  active: false
};

// 初始化地图
onMounted(async () => {
  // 创建地图实例
  map.value = L.map(mapContainer.value, {
    center: [35.86166, 104.195397],
    zoom: 4
  });

  // 添加底图
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value);

  // 添加图层组
  Object.values(layerGroups).forEach(group => {
    group.addTo(map.value);
  });

  // 绑定事件
  map.value.on('mousemove', handleMouseMove);
  map.value.on('click', handleMapClick);

  // 加载图层
  await loadLayers();
});

// 清理
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// 监听工具变化
watch(currentTool, (tool, oldTool) => {
  if (oldTool === 'measure') {
    clearMeasure();
  }
  if (oldTool === 'draw') {
    clearDraw();
  }
});

// 加载图层
const loadLayers = async () => {
  await layerStore.fetchLayers();
  layers.value = layerStore.layers;
  updateLayers();
};

// 更新图层
const updateLayers = () => {
  // 清除现有数据
  Object.values(layerGroups).forEach(group => group.clearLayers());

  // 更新点图层
  if (layerStore.hasVisibleLayer('point')) {
    const points = dataStore.points;
    points.forEach(point => {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: createCustomIcon(point)
      });
      marker.bindPopup(createPopupContent(point));
      layerGroups.points.addLayer(marker);
    });
  }

  // 更新热力图
  if (layerStore.hasVisibleLayer('heatmap')) {
    const heatData = dataStore.getHeatmapData();
    layerGroups.heatmap.setLatLngs(heatData);
  }

  // 更新区域图层
  if (layerStore.hasVisibleLayer('region')) {
    // 这里添加区域数据的处理逻辑
  }
};



// 创建弹窗内容
const createPopupContent = (point) => {
  return `
    <div class="popup-content">
      <h3>${point.name}</h3>
      <p>类型: ${point.category}</p>
      <p>数值: ${point.value}</p>
      <p>时间: ${new Date(point.timestamp).toLocaleString()}</p>
    </div>
  `;
};

// 图层图标
const getLayerIcon = (type) => {
  const icons = {
    point: Location,
    heatmap: Histogram,
    region: MapLocation,
    track: DataLine
  };
  return icons[type] || Location;
};

// 切换图层显示
const toggleLayer = async (layer) => {
  await layerStore.toggleLayerVisibility(layer.id);
  updateLayers();
};

// 鼠标移动处理
const handleMouseMove = (e) => {
  currentCoordinate.value = e.latlng;
};

// 地图点击处理
const handleMapClick = (e) => {
  if (currentTool.value === 'measure') {
    handleMeasureClick(e);
  } else if (currentTool.value === 'draw') {
    handleDrawClick(e);
  }
};

// 测量工具点击处理
const handleMeasureClick = (e) => {
  const { lat, lng } = e.latlng;
  measureTool.points.push([lat, lng]);

  if (measureTool.line) {
    measureTool.line.addLatLng([lat, lng]);
  } else {
    measureTool.line = L.polyline(measureTool.points, {
      color: '#409EFF',
      weight: 2
    }).addTo(map.value);
  }

  // 计算总距离
  if (measureTool.points.length > 1) {
    const distance = calculateDistance(measureTool.points);
    emit('measure-update', distance);
  }
};

// 绘制工具点击处理
const handleDrawClick = (e) => {
  const { lat, lng } = e.latlng;
  drawTool.points.push([lat, lng]);

  if (drawTool.shape) {
    drawTool.shape.addLatLng([lat, lng]);
  } else {
    drawTool.shape = L.polyline(drawTool.points, {
      color: '#67C23A',
      weight: 2
    }).addTo(map.value);
  }
};

// 清除测量
const clearMeasure = () => {
  if (measureTool.line) {
    map.value.removeLayer(measureTool.line);
    measureTool.line = null;
  }
  measureTool.points = [];
  emit('measure-update', 0);
};

// 清除绘制
const clearDraw = () => {
  if (drawTool.shape) {
    map.value.removeLayer(drawTool.shape);
    drawTool.shape = null;
  }
  drawTool.points = [];
};

// 计算距离
const calculateDistance = (points) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += map.value.distance(points[i-1], points[i]);
  }
  return total;
};

// 定位到指定点
const locatePoint = (point) => {
  if (!point || !point.latitude || !point.longitude) return;

  map.value.setView([point.latitude, point.longitude], 12);

  // 添加临时标记
  const marker = L.marker([point.latitude, point.longitude], {
    icon: createCustomIcon(point)
  }).addTo(map.value);

  marker.bindPopup(createPopupContent(point)).openPopup();

  // 3秒后移除标记
  setTimeout(() => {
    map.value.removeLayer(marker);
  }, 3000);
};

// 设置工具
const setTool = (tool) => {
  currentTool.value = tool;
};

// 重置视图
const resetView = () => {
  map.value.setView([35.86166, 104.195397], 4);
};

// 调整大小
const resize = () => {
  map.value?.invalidateSize();
};

// 暴露方法
defineExpose({
  setTool,
  resetView,
  locatePoint,
  resize
});

</script>
<style lang="scss">
/* 全局样式 */
.custom-marker-container {
  .custom-marker {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }
}

.popup-content {
  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
  }
}
</style>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;

  .tool-tip {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 1000;
    text-align: center;

    p {
      margin: 5px 0;
      font-size: 14px;
    }
  }

  .layer-control {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: white;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .coordinate-info {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    p {
      margin: 5px 0;
    }
  }
}
</style>