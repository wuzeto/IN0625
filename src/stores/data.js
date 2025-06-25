import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', {
  state: () => ({
    points: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchPoints() {
      this.loading = true;
      this.error = null;
      try {
        // 模拟从数据库获取数据
        const response = await fetch('/api/geo_points?limit=10000');
        const data = await response.json();
        this.points = data.map(point => ({
          id: point.id,
          latitude: point.latitude,
          longitude: point.longitude,
          name: `点位 ${point.id}`,
          value: Math.random() * 100, // 模拟数值
          category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)], // 模拟类型
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        this.error = error.message;
        console.error('Failed to fetch points:', error);
      } finally {
        this.loading = false;
      }
    },

    getHeatmapData() {
      return this.points.map(point => [
        point.latitude,
        point.longitude,
        point.value
      ]);
    }
  }
});