import { defineStore } from 'pinia';

export const useLayerStore = defineStore('layer', {
  state: () => ({
    layers: [],
    activeLayer: null
  }),

  getters: {
    visibleLayers: (state) => {
      return state.layers.filter(layer => layer.visible);
    },

    getLayerById: (state) => (id) => {
      return state.layers.find(layer => layer.id === id);
    },

    hasVisibleLayer: (state) => (type) => {
      return state.layers.some(layer => layer.visible && layer.type === type);
    }
  },

  actions: {
    async fetchLayers() {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟图层数据
        this.layers = [
          {
            id: 1,
            name: '点图层',
            type: 'point',
            visible: true,
            style: {
              iconSize: 25,
              iconColor: '#409EFF',
              cluster: true
            }
          },
          {
            id: 2,
            name: '热力图',
            type: 'heatmap',
            visible: true,
            style: {
              radius: 25,
              blur: 15,
              gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
              }
            }
          },
          {
            id: 3,
            name: '区域图层',
            type: 'region',
            visible: true,
            style: {
              fillColor: 'rgba(64, 158, 255, 0.2)',
              strokeColor: '#409EFF',
              strokeWidth: 2
            }
          }
        ];
      } catch (error) {
        console.error('Failed to fetch layers:', error);
      }
    },

    async addLayer(layer) {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newLayer = {
          id: this.layers.length + 1,
          visible: true,
          ...layer
        };

        this.layers.push(newLayer);
        return newLayer;
      } catch (error) {
        console.error('Failed to add layer:', error);
        throw error;
      }
    },

    async updateLayer(id, updates) {
      try {
        const layer = this.getLayerById(id);
        if (!layer) throw new Error('Layer not found');

        Object.assign(layer, updates);
      } catch (error) {
        console.error('Failed to update layer:', error);
        throw error;
      }
    },

    async deleteLayer(id) {
      try {
        const index = this.layers.findIndex(layer => layer.id === id);
        if (index === -1) throw new Error('Layer not found');

        this.layers.splice(index, 1);
      } catch (error) {
        console.error('Failed to delete layer:', error);
        throw error;
      }
    },

    setActiveLayer(id) {
      this.activeLayer = id;
    },

    toggleLayerVisibility(id) {
      const layer = this.getLayerById(id);
      if (layer) {
        layer.visible = !layer.visible;
      }
    }
  }
});