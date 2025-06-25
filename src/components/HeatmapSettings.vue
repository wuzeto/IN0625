<template>
  <div class="heatmap-settings">
    <el-form label-position="top" :model="settings">
      <el-form-item label="热力图半径">
        <el-slider
          v-model="settings.radius"
          :min="10"
          :max="50"
          :step="1"
          @change="updateSettings"
        />
      </el-form-item>

      <el-form-item label="模糊度">
        <el-slider
          v-model="settings.blur"
          :min="5"
          :max="30"
          :step="1"
          @change="updateSettings"
        />
      </el-form-item>

      <el-form-item label="最大缩放级别">
        <el-slider
          v-model="settings.maxZoom"
          :min="5"
          :max="18"
          :step="1"
          @change="updateSettings"
        />
      </el-form-item>

      <el-form-item label="颜色配置">
        <div class="gradient-stops">
          <div 
            v-for="(color, stop) in settings.gradient" 
            :key="stop"
            class="gradient-stop"
          >
            <el-color-picker 
              v-model="settings.gradient[stop]"
              @change="updateSettings"
            />
            <span>{{ (Number(stop) * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    })
  }
});

const emit = defineEmits(['update:modelValue']);

const settings = ref({ ...props.modelValue });

watch(() => props.modelValue, (newVal) => {
  settings.value = { ...newVal };
}, { deep: true });

const updateSettings = () => {
  emit('update:modelValue', { ...settings.value });
};
</script>

<style lang="scss" scoped>
.heatmap-settings {
  padding: 20px;

  .gradient-stops {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .gradient-stop {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      span {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>