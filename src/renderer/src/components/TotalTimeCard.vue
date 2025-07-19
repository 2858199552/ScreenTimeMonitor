<template>
  <div class="total-time-card">
    <!-- 左侧：总使用时间和图表 -->
    <div class="time-section">
      <div class="total-time-content">
        <div class="total-time-number">{{ formattedTotalTime }}</div>
        <div class="total-time-label">今日总使用时间</div>
      </div>
      <div class="time-chart">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="55"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="6"
          />
          <circle
            cx="70"
            cy="70"
            r="55"
            fill="none"
            stroke="#ec4141"
            stroke-width="6"
            stroke-dasharray="346"
            stroke-dashoffset="87"
            stroke-linecap="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
      </div>
    </div>

    <!-- 右侧：正在运行的应用 -->
    <div class="running-apps-section">
      <div class="running-apps-header">
        <h3 class="running-apps-title">
          <span class="status-dot"></span>
          正在运行的应用
        </h3>
        <div class="running-apps-actions">
          <button 
            class="refresh-btn" 
            @click="$emit('refresh-running-apps')"
            :disabled="isLoading"
            :title="isLoading ? '刷新中...' : '刷新应用列表'"
          >
            <svg 
              class="refresh-icon" 
              :class="{ 'spinning': isLoading }" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C13.3897 3 14.7072 3.33238 15.8906 3.93137L14.5 5.5" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="running-apps-list">
        <!-- 加载状态 -->
        <div v-if="isLoading && runningApps.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <span>正在获取应用列表...</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <span class="error-icon">⚠️</span>
          <span class="error-message">{{ error }}</span>
        </div>

        <!-- 应用列表 -->
        <div v-else-if="runningApps.length > 0" class="apps-list">
          <div 
            v-for="app in displayedApps" 
            :key="app.pid" 
            class="running-app-item"
          >
            <div class="app-info">
              <span class="app-icon">{{ getAppIcon(app.name) }}</span>
              <div class="app-details">
                <div class="app-name" :title="app.name">{{ app.name }}</div>
                <div class="app-meta">
                  <span v-if="app.formattedUsageTime" class="usage-time">
                    {{ app.formattedUsageTime }}
                  </span>
                  <span v-if="app.windowTitle" class="app-window" :title="app.windowTitle">
                    {{ app.windowTitle }}
                  </span>
                </div>
              </div>
            </div>
            <div class="app-status">
              <span class="status-indicator" :class="{ active: app.isActive }">
                {{ app.isActive ? '活跃' : '后台' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <span class="empty-icon">📱</span>
          <span>暂无运行中的应用</span>
        </div>
      </div>

      <!-- 底部信息 -->
      <div v-if="lastUpdated" class="running-apps-footer">
        <span class="last-updated">
          最后更新: {{ formatUpdateTime(lastUpdated) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  formattedTotalTime: {
    type: String,
    required: true
  },
  runningApps: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: null
  },
  getAppIcon: {
    type: Function,
    required: true
  }
})

defineEmits(['refresh-running-apps'])

// 显示前8个应用
const displayedApps = computed(() => {
  return props.runningApps.slice(0, 8)
})

// 格式化更新时间
const formatUpdateTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.total-time-card {
  flex: 0 0 360px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 24px;
  align-items: stretch;
  min-height: 280px;
  color: #ffffff;
}

/* 左侧时间部分 */
.time-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.total-time-content {
  text-align: center;
}

.total-time-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-time-label {
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 500;
}

.time-chart {
  position: relative;
}

/* 右侧正在运行的应用部分 */
.running-apps-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.running-apps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.running-apps-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.running-apps-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 6px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  transition: transform 0.3s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.running-apps-list {
  flex: 1;
  overflow: hidden;
}

.apps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.apps-list::-webkit-scrollbar {
  width: 4px;
}

.apps-list::-webkit-scrollbar-track {
  background: transparent;
}

.apps-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.running-app-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.running-app-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.app-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.app-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.app-details {
  min-width: 0;
  flex: 1;
}

.app-name {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
}

.usage-time {
  color: #4ade80;
  font-weight: 500;
  background: rgba(74, 222, 128, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.app-window {
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  flex: 1;
  min-width: 0;
}

.app-status {
  flex-shrink: 0;
}

.status-indicator {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.status-indicator.active {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.status-indicator:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

/* 状态样式 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
  opacity: 0.8;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon,
.empty-icon {
  font-size: 1.5rem;
}

.error-message {
  font-size: 0.85rem;
}

.running-apps-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.last-updated {
  font-size: 0.7rem;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .total-time-card {
    flex-direction: column;
    gap: 16px;
    min-height: auto;
  }
  
  .time-section {
    justify-content: center;
  }
  
  .running-apps-section {
    min-height: 200px;
  }
}
</style>
