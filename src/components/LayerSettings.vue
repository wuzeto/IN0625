<template>
  <div class="layer-settings">
    <!-- 点图层设置 -->
    <template v-if="layer.type === 'point'">
      <el-form label-width="100px">
        <el-form-item label="点大小">
          <el-slider
              v-model="settings.iconSize"
              :min="10"
              :max="50"
              @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="点颜色">
          <el-color-picker
              v-model="settings.iconColor"
              @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="聚合显示">
          <el-switch
              v-model="settings.cluster"
              @change="updateSettings"
          />
        </el-form-item>
      </el-form>
    </template>

    <!-- 热力图设置 -->
    <template v-if="layer.type === 'heatmap'">
      <el-form label-width="100px">
        <el-form-item label="半径">
          <el-slider
              v-model="settings.radius"
              :min="10"
              :max="50"
              @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="模糊度">
          <el-slider
              v-model="settings.blur"
              :min="5"
              :max="30"
              @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="渐变色">
          <div class="gradient-editor">
            <div
                v-for="(color, stop) in settings.gradient"
                :key="stop"
                class="gradient-stop"
            >
              <span class="stop-value">{{ stop }}</span>
              <el-color-picker
                  v-model="settings.gradient[stop]"
                  @change="updateSettings"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </template>

    <!-- 区域图层设置 -->
    <template v-if="layer.type === 'region'">
      <el-form label-width="100px">
        <el-form-item label="填充颜色">
          <el-color-picker
              v-model="settings.fillColor"
              show-alpha
              @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="边框颜色">
          <el-color-picker
              v-model="settings.strokeColor"
              @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="边框宽度">
          <el-slider
              v-model="settings.strokeWidth"
              :min="1"
              :max="5"
              @change="updateSettings"
          />
        </el-form-item>
      </el-form>
    </template>

    <!-- 通用设置 -->
    <el-divider>通用设置</el-divider>
    <el-form label-width="100px">
      <el-form-item label="图层透明度">
        <el-slider
            v-model="opacity"
            :min="0"
            :max="100"
            :format-tooltip="value => `${value}%`"
            @change="updateOpacity"
        />
      </el-form-item>
      <el-form-item label="刷新间隔">
        <el-input-number
            v-model="refreshInterval"
            :min="5"
            :max="3600"
            :step="5"
            @change="updateRefreshInterval"
        >
          <template #append>秒</template>
        </el-input-number>
      </el-form-item>
      <el-form-item label="数据过滤">
        <el-select
            v-model="timeFilter"
            placeholder="选择时间范围"
            @change="updateTimeFilter"
        >
          <el-option label="全部数据" value="all" />
          <el-option label="最近24小时" value="24h" />
          <el-option label="最近7天" value="7d" />
          <el-option label="最近30天" value="30d" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLayerStore } from '../stores/layer';

const props = defineProps({
  layer: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update']);

const layerStore = useLayerStore();

// 设置状态
const settings = ref({ ...props.layer.style });
const opacity = ref(100);
const refreshInterval = ref(30);
const timeFilter = ref('all');

// 监听图层变化
watch(() => props.layer, (newLayer) => {
  settings.value = { ...newLayer.style };
}, { deep: true });

// 更新设置
const updateSettings = async () => {
  try {
    await layerStore.updateLayer(props.layer.id, {
      style: { ...settings.value }
    });
    emit('update');
  } catch (error) {
    ElMessage.error('更新设置失败');
  }
};

// 更新透明度
const updateOpacity = (value) => {
  try {
    const opacity = value / 100;
    switch (props.layer.type) {
      case 'point':
        settings.value.iconOpacity = opacity;
        break;
      case 'heatmap':
        settings.value.opacity = opacity;
        break;
      case 'region':
        settings.value.fillOpacity = opacity;
        break;
    }
    updateSettings();
  } catch (error) {
    ElMessage.error('更新透明度失败');
  }
};

// 更新刷新间隔
const updateRefreshInterval = async (value) => {
  try {
    await layerStore.updateLayer(props.layer.id, {
      refreshInterval: value
    });
    emit('update');
  } catch (error) {
    ElMessage.error('更新刷新间隔失败');
  }
};

// 更新时间过滤
const updateTimeFilter = async (value) => {
  try {
    await layerStore.updateLayer(props.layer.id, {
      timeFilter: value
    });
    emit('update');
  } catch (error) {
    ElMessage.error('更新时间过滤失败');
  }
};
</script>

<style lang="scss" scoped>
.layer-settings {
  padding: 20px;

  .gradient-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .gradient-stop {
      display: flex;
      align-items: center;
      gap: 10px;

      .stop-value {
        width: 40px;
        text-align: right;
      }
    }
  }

  .el-divider {
    margin: 24px 0;
  }
}
</style>