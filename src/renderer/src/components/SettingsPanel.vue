<template>
  <div v-if="isVisible" class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-panel">
      <div class="settings-header">
        <h2 class="settings-title">⚙️ 应用设置</h2>
        <button class="close-btn" @click="$emit('close')" title="关闭设置">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="settings-content">
        <div class="settings-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <div class="settings-body">
          <!-- 基本设置 -->
          <div v-if="activeTab === 'general'" class="settings-section">
            <h3>基本设置</h3>
            
            <div class="setting-item">
              <label class="setting-label">主题</label>
              <select v-model="localSettings.theme" class="setting-select">
                <option value="dark">深色主题</option>
                <option value="light">浅色主题</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input 
                  v-model="localSettings.notifications" 
                  type="checkbox" 
                  class="setting-checkbox"
                >
                启用通知
              </label>
              <p class="setting-description">在使用时间达到预设值时显示提醒</p>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input 
                  v-model="localSettings.minimizeToTray" 
                  type="checkbox" 
                  class="setting-checkbox"
                >
                最小化到系统托盘
              </label>
              <p class="setting-description">关闭窗口时保持应用在后台运行</p>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input 
                  v-model="localSettings.autoStart" 
                  type="checkbox" 
                  class="setting-checkbox"
                >
                开机自启动
              </label>
              <p class="setting-description">系统启动时自动运行应用</p>
            </div>

            <div class="setting-item">
              <label class="setting-label">数据保留天数</label>
              <input 
                v-model.number="localSettings.dataRetentionDays" 
                type="number" 
                min="7" 
                max="365" 
                class="setting-input"
              >
              <p class="setting-description">超过此天数的数据将被自动清理</p>
            </div>
          </div>

          <!-- 调试设置 -->
          <div v-if="activeTab === 'debug'" class="settings-section">
            <h3>调试工具</h3>
            
            <div class="setting-item">
              <label class="setting-label">
                <input 
                  v-model="localSettings.debugMode" 
                  type="checkbox" 
                  class="setting-checkbox"
                >
                调试模式
              </label>
              <p class="setting-description">启用详细的调试信息和错误报告</p>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input 
                  v-model="localSettings.enableLogging" 
                  type="checkbox" 
                  class="setting-checkbox"
                >
                启用日志记录
              </label>
              <p class="setting-description">记录应用运行日志，用于问题排查</p>
            </div>

            <div class="debug-actions">
              <h4>调试操作</h4>
              <div class="action-buttons">
                <button class="action-btn" @click="$emit('test-notification')">
                  🔔 测试通知
                </button>
                <button class="action-btn" @click="$emit('test-error')">
                  ⚠️ 测试错误
                </button>
                <button class="action-btn" @click="$emit('open-dev-tools')">
                  🛠️ 开发者工具
                </button>
                <button class="action-btn" @click="$emit('reload-app')">
                  🔄 重新加载
                </button>
              </div>
            </div>

            <div class="debug-info">
              <h4>系统信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">应用版本:</span>
                  <span class="info-value">{{ debugInfo.appVersion }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">平台:</span>
                  <span class="info-value">{{ debugInfo.platform }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">运行时间:</span>
                  <span class="info-value">{{ formatUptime(debugInfo.uptime) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">内存使用:</span>
                  <span class="info-value">{{ formatMemory(debugInfo.memoryUsage) }}</span>
                </div>
              </div>
            </div>

            <div v-if="logs.length > 0" class="debug-logs">
              <div class="logs-header">
                <h4>调试日志</h4>
                <div class="logs-actions">
                  <button class="action-btn-sm" @click="$emit('export-logs')">导出</button>
                  <button class="action-btn-sm" @click="$emit('clear-logs')">清空</button>
                </div>
              </div>
              <div class="logs-container">
                <div v-for="log in logs.slice(0, 50)" :key="log.id" class="log-entry" :class="log.level">
                  <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                  <span class="log-level">{{ log.level.toUpperCase() }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 数据存档 -->
          <div v-if="activeTab === 'archive'" class="settings-section">
            <h3>数据存档</h3>
            
            <div class="archive-status">
              <h4>存档状态</h4>
              <div class="status-grid">
                <div class="status-item">
                  <span class="status-label">最后备份:</span>
                  <span class="status-value">
                    {{ archiveInfo.lastBackupTime ? formatDate(archiveInfo.lastBackupTime) : '从未备份' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">备份状态:</span>
                  <span class="status-value" :class="archiveInfo.backupStatus">
                    {{ getBackupStatusText(archiveInfo.backupStatus) }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">数据记录:</span>
                  <span class="status-value">{{ dataStats.totalRecords }} 条</span>
                </div>
                <div class="status-item">
                  <span class="status-label">数据大小:</span>
                  <span class="status-value">{{ formatFileSize(dataStats.dataSize) }}</span>
                </div>
              </div>
            </div>

            <div class="archive-actions">
              <h4>存档操作</h4>
              <div class="action-buttons">
                <button 
                  class="action-btn" 
                  @click="$emit('create-backup')"
                  :disabled="archiveInfo.backupStatus === 'backing'"
                >
                  💾 {{ archiveInfo.backupStatus === 'backing' ? '备份中...' : '创建备份' }}
                </button>
                <button class="action-btn" @click="triggerFileInput">
                  📂 恢复备份
                </button>
                <button class="action-btn" @click="$emit('export-data')">
                  📤 导出数据
                </button>
                <button class="action-btn danger" @click="confirmClearData">
                  🗑️ 清空数据
                </button>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input 
                  v-model="localArchiveInfo.autoBackupEnabled" 
                  type="checkbox" 
                  class="setting-checkbox"
                >
                自动备份
              </label>
              <p class="setting-description">定期自动创建数据备份</p>
            </div>

            <div v-if="localArchiveInfo.autoBackupEnabled" class="setting-item">
              <label class="setting-label">备份频率</label>
              <select v-model="localArchiveInfo.backupFrequency" class="setting-select">
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-save" @click="handleSave">保存设置</button>
      </div>

      <!-- 隐藏的文件输入 -->
      <input 
        ref="fileInput" 
        type="file" 
        accept=".json" 
        style="display: none" 
        @change="handleFileSelect"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    required: true
  },
  debugInfo: {
    type: Object,
    default: () => ({})
  },
  logs: {
    type: Array,
    default: () => []
  },
  archiveInfo: {
    type: Object,
    default: () => ({})
  },
  dataStats: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'close',
  'save',
  'test-notification',
  'test-error',
  'open-dev-tools',
  'reload-app',
  'export-logs',
  'clear-logs',
  'create-backup',
  'restore-backup',
  'export-data',
  'clear-data'
])

const activeTab = ref('general')
const fileInput = ref(null)

const tabs = [
  { id: 'general', label: '基本设置', icon: '⚙️' },
  { id: 'debug', label: '调试工具', icon: '🐛' },
  { id: 'archive', label: '数据存档', icon: '💾' }
]

// 本地设置副本
const localSettings = reactive({ ...props.settings })
const localArchiveInfo = reactive({ ...props.archiveInfo })

// 监听 props 变化
watch(() => props.settings, (newSettings) => {
  Object.assign(localSettings, newSettings)
}, { deep: true })

watch(() => props.archiveInfo, (newArchiveInfo) => {
  Object.assign(localArchiveInfo, newArchiveInfo)
}, { deep: true })

// 格式化函数
const formatUptime = (uptime) => {
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

const formatMemory = (memoryUsage) => {
  if (!memoryUsage.heapUsed) return 'N/A'
  return `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`
}

const formatLogTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getBackupStatusText = (status) => {
  const statusMap = {
    idle: '空闲',
    backing: '备份中',
    restoring: '恢复中',
    error: '错误'
  }
  return statusMap[status] || '未知'
}

// 事件处理
const handleSave = () => {
  emit('save', { 
    settings: { ...localSettings },
    archiveInfo: { ...localArchiveInfo }
  })
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('restore-backup', file)
  }
}

const confirmClearData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
    emit('clear-data')
  }
}
</script>
