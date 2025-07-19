<template>
  <div class="app-usage-section">
    <h2 class="section-title">应用使用详情</h2>

    <!-- 按类别分组显示 -->
    <div v-for="(apps, category) in groupedByCategory" :key="category" class="category-group">
      <div class="category-header">
        <span class="category-name">{{ category }}</span>
        <span class="category-total">{{
          formatTime(apps.reduce((sum, app) => sum + app.time, 0))
        }}</span>
      </div>

      <div class="app-list">
        <div v-for="app in apps" :key="app.name" class="app-item">
          <div class="app-info">
            <div class="app-icon" :style="{ backgroundColor: app.color }">
              {{ app.icon }}
            </div>
            <div class="app-details">
              <div class="app-name">{{ app.name }}</div>
              <div class="app-time">{{ formatTime(app.time) }}</div>
            </div>
          </div>
          <div class="app-stats">
            <div class="usage-percentage">{{ getUsagePercentageLocal(app.time) }}%</div>
            <div class="usage-bar">
              <div
                class="usage-fill"
                :style="{
                  width: getUsagePercentageLocal(app.time) + '%',
                  backgroundColor: app.color
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime, getUsagePercentage } from '../utils/formatUtils.js'

const props = defineProps({
  groupedByCategory: {
    type: Object,
    required: true
  },
  totalUsageTime: {
    type: Number,
    required: true
  }
})

// 本地使用的函数，传入 totalUsageTime
const getUsagePercentageLocal = (time) => {
  return getUsagePercentage(time, props.totalUsageTime)
}
</script>
