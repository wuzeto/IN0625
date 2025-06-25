<template>
  <div class="map-page">
    <!-- 侧边面板 -->
    <div class="side-panel" :class="{ collapsed: isPanelCollapsed }">
      <div class="panel-header">
        <h3>图层管理</h3>
        <el-button
            :icon="isPanelCollapsed ? Expand : Fold"
            @click="togglePanel"
        />
      </div>


        <div class="layer-list">
          <el-tree
              :data="layers"
              :props="defaultProps"
              show-checkbox
              node-key="id"
              @check="handleLayerChange"
          >
            <template #default="{ node, data }">
              <div class="layer-item">
                <el-icon><component :is="getLayerIcon(data.type)" /></el-icon>
                <span>{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>


      <div v-show="!isPanelCollapsed" class="panel-content">
        <!-- 图层列表 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="图层列表" name="layers">
            <layer-list @layer-change="handleLayerChange" />
          </el-collapse-item>

          <!-- 数据统计 -->
          <el-collapse-item title="数据统计" name="statistics">
            <statistics />
          </el-collapse-item>
        </el-collapse>

        <!-- 工具栏 -->
        <div class="tool-bar">
          <el-button-group>
            <el-tooltip content="测距工具" placement="top">
              <el-button
                  :type="currentTool === 'measure' ? 'primary' : 'default'"
                  :icon="Ruler"
                  @click="setTool('measure')"
              />
            </el-tooltip>
            <el-tooltip content="绘制工具" placement="top">
              <el-button
                  :type="currentTool === 'draw' ? 'primary' : 'default'"
                  :icon="Edit"
                  @click="setTool('draw')"
              />
            </el-tooltip>
            <el-tooltip content="重置视图" placement="top">
              <el-button :icon="RefreshRight" @click="resetView" />
            </el-tooltip>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <map-view
          ref="mapViewRef"
          @measure-update="handleMeasureUpdate"
      />
    </div>

    <!-- 测量结果 -->
    <div v-if="measureDistance" class="measure-result">
      测量距离：{{ formatDistance(measureDistance) }}
    </div>

    <!-- 数据对话框 -->
    <add-data-dialog
        v-model="showAddDataDialog"
        @success="handleDataAdded"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Location, Histogram, MapLocation } from '@element-plus/icons-vue';

const emit = defineEmits(['layer-change']);

const layers = ref([
  {
    id: 1,
    label: '点位图层',
    type: 'point',
    visible: true
  },
  {
    id: 2,
    label: '热力图层',
    type: 'heatmap',
    visible: false
  },
  {
    id: 3,
    label: '区域图层',
    type: 'region',
    visible: false
  }
]);

const defaultProps = {
  children: 'children',
  label: 'label'
};

// 获取图层图标
const getLayerIcon = (type) => {
  const icons = {
    point: Location,
    heatmap: Histogram,
    region: MapLocation
  };
  return icons[type] || Location;
};

// 处理图层变化
const handleLayerChange = (checkedNodes) => {
  const visibleLayers = layers.value.map(layer => ({
    ...layer,
    visible: checkedNodes.includes(layer.id)
  }));
  emit('layer-change', visibleLayers);
};
</script>

<style lang="scss" scoped>
.layer-list {
  .layer-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 16px;
    }
  }
}
.map-page {
  height: 100%;
  position: relative;
  display: flex;

  .side-panel {
    width: 300px;
    background: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    z-index: 1;

    &.collapsed {
      width: 48px;
    }

    .panel-header {
      height: 48px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ebeef5;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: normal;
      }
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;

      .tool-bar {
        margin-top: 16px;
        display: flex;
        justify-content: center;
      }
    }
  }

  .map-container {
    flex: 1;
    height: 100%;
    position: relative;
  }

  .measure-result {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
  }
}

:deep(.el-collapse) {
  border: none;

  .el-collapse-item__header {
    font-size: 14px;
    color: #606266;
  }

  .el-collapse-item__wrap {
    border-bottom: none;
  }

  .el-collapse-item__content {
    padding: 16px 0;
  }
}
</style>