import { ref } from 'vue'

/**
 * 调试功能管理 composable
 */
export function useDebug() {
  const debugInfo = ref({
    appVersion: '1.0.0',
    electronVersion: '',
    nodeVersion: '',
    chromeVersion: '',
    platform: '',
    uptime: 0,
    memoryUsage: {},
    lastError: null
  })

  const logs = ref([])
  const isDebugPanelVisible = ref(false)

  // 获取系统信息
  const getSystemInfo = async () => {
    try {
      if (window.api && window.api.getSystemInfo) {
        const result = await window.api.getSystemInfo()
        if (result.success) {
          Object.assign(debugInfo.value, result.data)
        }
      } else {
        // 浏览器环境的备用信息
        debugInfo.value = {
          ...debugInfo.value,
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          language: navigator.language,
          onlineStatus: navigator.onLine
        }
      }
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  // 添加日志
  const addLog = (level, message, data = null) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }
    
    logs.value.unshift(logEntry)
    
    // 限制日志数量
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(0, 1000)
    }
    
    console[level](`[${level.toUpperCase()}]`, message, data)
  }

  // 清空日志
  const clearLogs = () => {
    logs.value = []
  }

  // 导出日志
  const exportLogs = () => {
    const logsData = {
      exportTime: new Date().toISOString(),
      debugInfo: debugInfo.value,
      logs: logs.value
    }
    
    const dataStr = JSON.stringify(logsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 测试通知
  const testNotification = async () => {
    try {
      if (window.api && window.api.showNotification) {
        await window.api.showNotification('测试通知', '这是一个测试通知消息')
        addLog('info', '测试通知发送成功')
      } else {
        addLog('warn', '通知功能不可用（非 Electron 环境）')
      }
    } catch (error) {
      addLog('error', '测试通知失败', error.message)
    }
  }

  // 测试错误处理
  const testError = () => {
    try {
      throw new Error('这是一个测试错误')
    } catch (error) {
      debugInfo.value.lastError = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
      addLog('error', '测试错误触发', error.message)
    }
  }

  // 显示/隐藏调试面板
  const toggleDebugPanel = () => {
    isDebugPanelVisible.value = !isDebugPanelVisible.value
  }

  // 重新加载应用
  const reloadApp = async () => {
    try {
      if (window.api && window.api.reloadApp) {
        await window.api.reloadApp()
      } else {
        window.location.reload()
      }
    } catch (error) {
      addLog('error', '重新加载失败', error.message)
    }
  }

  // 打开开发者工具
  const openDevTools = async () => {
    try {
      if (window.api && window.api.openDevTools) {
        await window.api.openDevTools()
        addLog('info', '开发者工具已打开')
      } else {
        addLog('warn', '开发者工具不可用（非 Electron 环境）')
      }
    } catch (error) {
      addLog('error', '打开开发者工具失败', error.message)
    }
  }

  return {
    debugInfo,
    logs,
    isDebugPanelVisible,
    getSystemInfo,
    addLog,
    clearLogs,
    exportLogs,
    testNotification,
    testError,
    toggleDebugPanel,
    reloadApp,
    openDevTools
  }
}
