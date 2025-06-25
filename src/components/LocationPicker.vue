<template>
  <div class="location-picker">
    <div ref="mapContainer" class="map-container"></div>
    <div class="coordinates-display" v-if="currentPosition">
      <p>纬度: {{ formatCoordinate(currentPosition.lat, 'N') }}</p>
      <p>经度: {{ formatCoordinate(currentPosition.lng, 'E') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import { formatCoordinate } from '../utils/formatters';

const emit = defineEmits(['location-selected']);

const mapContainer = ref(null);
const currentPosition = ref(null);
let map = null;
let marker = null;

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});

const initMap = () => {
  // 初始化地图
  map = L.map(mapContainer.value).setView([35.86166, 104.195397], 4);

  // 添加底图
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // 添加比例尺
  L.control.scale({
    imperial: false,
    metric: true
  }).addTo(map);

  // 点击事件处理
  map.on('click', handleMapClick);
};

const handleMapClick = (e) => {
  const { lat, lng } = e.latlng;
  
  // 更新标记
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], {
      draggable: true
    }).addTo(map);

    // 拖动事件
    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      updatePosition(position);
    });
  }

  updatePosition({ lat, lng });
};

const updatePosition = (position) => {
  currentPosition.value = position;
  emit('location-selected', position);
};
</script>

<style lang="scss" scoped>
.location-picker {
  position: relative;
  width: 100%;
  height: 100%;

  .map-container {
    width: 100%;
    height: 100%;
  }

  .coordinates-display {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    p {
      margin: 5px 0;
      font-size: 14px;
    }
  }
}
</style>