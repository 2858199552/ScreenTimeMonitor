<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 导入组件
import AppHeader from './components/AppHeader.vue'
import TotalTimeCard from './components/TotalTimeCard.vue'
import AppUsageSection from './components/AppUsageSection.vue'
import QuickActions from './components/QuickActions.vue'
import SettingsPanel from './components/SettingsPanel.vue'

// 导入 composables
import { useAppData } from './composables/useAppData.js'
import { useTheme } from './composables/useTheme.js'
import { useTrayFunctions } from './composables/useTrayFunctions.js'
import { useSettings } from './composables/useSettings.js'
import { useDebug } from './composables/useDebug.js'
import { useDataArchive } from './composables/useDataArchive.js'
import { useRunningApps } from './composables/useRunningApps.js'

// 导入工具函数
import { formatDate, getSelectedDate } from './utils/dateUtils.js'
import { formatTime } from './utils/formatUtils.js'

// 使用 composables
const {
  selectedDateOffset,
  totalUsageTime,
  groupedByCategory,
  canGoBack,
  canGoForward,
  loadAppUsageData,
  goToPreviousDay,
  goToNextDay,
  goToToday
} = useAppData()

const { isDarkTheme, toggleTheme, initTheme, applySettings } = useTheme()

const { minimizeWindow, maximizeWindow, hideWindow, showNotification, setupTrayListeners } =
  useTrayFunctions()

// 设置相关
const {
  settings,
  isSettingsVisible,
  showSettings,
  hideSettings,
  saveSettings: saveSettingsData,
  loadSettings
} = useSettings()

// 调试相关
const {
  debugInfo,
  logs,
  getSystemInfo,
  addLog,
  clearLogs,
  exportLogs,
  testNotification: debugTestNotification,
  testError,
  reloadApp,
  openDevTools
} = useDebug()

// 数据存档相关
const {
  archiveInfo,
  getArchiveInfo,
  createBackup,
  exportAllData,
  importData,
  clearAllData,
  getDataStats,
  saveArchiveSettings,
  loadArchiveSettings
} = useDataArchive()

// 正在运行的应用相关
const {
  runningApps,
  isLoading: isLoadingRunningApps,
  error: runningAppsError,
  lastUpdated: runningAppsLastUpdated,
  fetchRunningApps,
  getAppIcon,
  startAutoRefresh,
  stopAutoRefresh
} = useRunningApps()

const isElectron = ref(false)

// 计算选中的实际日期
const selectedDate = computed(() => getSelectedDate(selectedDateOffset.value))

// 格式化的日期文本
const dateText = computed(() => formatDate(selectedDate.value))

// 格式化的总使用时间
const formattedTotalTime = computed(() => formatTime(totalUsageTime.value))

// 计算数据统计
const dataStats = computed(() => getDataStats())

// 设置事件处理
const handleShowSettings = () => {
  showSettings()
}

// 托盘功能事件处理
const handleShowNotification = () => {
  showNotification(totalUsageTime.value, formatTime)
}

// 设置页面事件处理
const handleSaveSettings = async (data) => {
  try {
    // 如果数据包含 settings 和 archiveInfo
    if (data.settings && data.archiveInfo) {
      // 更新设置
      Object.assign(settings.value, data.settings)
      // 更新存档信息
      Object.assign(archiveInfo.value, data.archiveInfo)
      
      const settingsSuccess = await saveSettingsData()
      const archiveSuccess = await saveArchiveSettings()
      
      if (settingsSuccess && archiveSuccess) {
        // 应用主题设置
        if (data.settings.theme !== settings.value.theme) {
          applySettings(data.settings)
        }
        hideSettings()
        addLog('info', '设置保存成功')
      } else {
        addLog('error', '设置保存失败')
      }
    } else {
      // 兼容旧的数据格式
      const success = await saveSettingsData()
      if (success) {
        // 应用主题设置
        if (data.theme !== settings.value.theme) {
          applySettings(data)
        }
        hideSettings()
        addLog('info', '设置保存成功')
      } else {
        addLog('error', '设置保存失败')
      }
    }
  } catch (error) {
    addLog('error', '设置保存失败', error.message)
  }
}

const handleTestNotification = () => {
  debugTestNotification()
}

const handleTestError = () => {
  testError()
}

const handleOpenDevTools = () => {
  openDevTools()
}

const handleReloadApp = () => {
  reloadApp()
}

const handleExportLogs = () => {
  exportLogs()
}

const handleClearLogs = () => {
  clearLogs()
}

const handleCreateBackup = async () => {
  try {
    addLog('info', '开始创建备份...')
    const result = await createBackup()
    if (result.success) {
      addLog('info', '备份创建成功')
    }
  } catch (error) {
    addLog('error', '备份创建失败', error.message)
  }
}

const handleRestoreBackup = async (file) => {
  try {
    addLog('info', '开始恢复备份...')
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        await importData(data)
        addLog('info', '备份恢复成功')
        // 重新加载数据
        await loadAppUsageData()
      } catch (error) {
        addLog('error', '备份恢复失败', error.message)
      }
    }
    reader.readAsText(file)
  } catch (error) {
    addLog('error', '备份恢复失败', error.message)
  }
}

const handleExportData = async () => {
  try {
    const data = await exportAllData()
    // 下载数据
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `screen-time-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    addLog('info', '数据导出成功')
  } catch (error) {
    addLog('error', '数据导出失败', error.message)
  }
}

const handleClearData = async () => {
  try {
    await clearAllData()
    addLog('info', '数据清空成功')
    // 重新加载默认数据
    await loadAppUsageData()
  } catch (error) {
    addLog('error', '数据清空失败', error.message)
  }
}

// 正在运行的应用事件处理
const handleRefreshRunningApps = async () => {
  try {
    await fetchRunningApps()
    addLog('info', '正在运行的应用列表已刷新')
  } catch (error) {
    addLog('error', '刷新应用列表失败', error.message)
  }
}

// 检查是否在 Electron 环境中
onMounted(async () => {
  isElectron.value = !!(window.electron && window.api)
  
  // 初始化主题
  initTheme()
  
  // 加载设置
  await loadSettings()
  
  // 加载存档设置
  await loadArchiveSettings()
  
  // 获取系统信息和存档信息
  await getSystemInfo()
  await getArchiveInfo()
  
  // 获取正在运行的应用
  await fetchRunningApps()
  
  if (isElectron.value) {
    // 加载数据（不需要再次应用设置，因为已经通过 loadSettings 加载了）
    await loadAppUsageData()
    
    // 设置托盘事件监听
    setupTrayListeners({
      onShowReport: () => {
        addLog('info', '托盘菜单：显示报告')
        // 这里可以切换到报告视图
      },
      onShowSettings: () => {
        addLog('info', '托盘菜单：显示设置')
        handleShowSettings()
      },
      onRefreshData: () => {
        addLog('info', '托盘菜单：刷新数据')
        loadAppUsageData()
      }
    })
  }
  
  // 记录启动日志
  addLog('info', '应用启动完成', {
    isElectron: isElectron.value,
    platform: debugInfo.value.platform
  })
  
  // 启动正在运行应用的自动刷新（每30秒）
  if (isElectron.value) {
    startAutoRefresh(30000)
  }
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  // 停止自动刷新定时器
  stopAutoRefresh()
})
</script>

<template>
  <div class="screen-time-app">
    <!-- 应用头部 -->
    <AppHeader
      :can-go-back="canGoBack"
      :can-go-forward="canGoForward"
      :date-text="dateText"
      :is-dark-theme="isDarkTheme"
      @go-to-previous-day="goToPreviousDay"
      @go-to-next-day="goToNextDay"
      @go-to-today="goToToday"
      @toggle-theme="toggleTheme"
      @minimize-window="minimizeWindow"
      @maximize-window="maximizeWindow"
      @hide-window="hideWindow"
    />

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 总使用时间卡片 -->
      <TotalTimeCard
        :formatted-total-time="formattedTotalTime"
        :running-apps="runningApps"
        :is-loading="isLoadingRunningApps"
        :error="runningAppsError"
        :last-updated="runningAppsLastUpdated"
        :get-app-icon="getAppIcon"
        @refresh-running-apps="handleRefreshRunningApps"
      />

      <!-- 应用使用详情 -->
      <AppUsageSection
        :grouped-by-category="groupedByCategory"
        :total-usage-time="totalUsageTime"
      />
    </div>

    <!-- 快速操作 -->
    <QuickActions
      @hide-window="hideWindow"
      @minimize-window="minimizeWindow"
      @show-notification="handleShowNotification"
      @refresh-data="loadAppUsageData"
      @show-settings="handleShowSettings"
    />

    <!-- 设置面板 -->
    <SettingsPanel
      :is-visible="isSettingsVisible"
      :settings="settings"
      :debug-info="debugInfo"
      :logs="logs"
      :archive-info="archiveInfo"
      :data-stats="dataStats"
      @close="hideSettings"
      @save="handleSaveSettings"
      @test-notification="handleTestNotification"
      @test-error="handleTestError"
      @open-dev-tools="handleOpenDevTools"
      @reload-app="handleReloadApp"
      @export-logs="handleExportLogs"
      @clear-logs="handleClearLogs"
      @create-backup="handleCreateBackup"
      @restore-backup="handleRestoreBackup"
      @export-data="handleExportData"
      @clear-data="handleClearData"
    />
  </div>
</template>
