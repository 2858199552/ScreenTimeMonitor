import { ref } from 'vue'

/**
 * 设置管理 composable
 */
export function useSettings() {
  const settings = ref({
    theme: 'dark',
    notifications: true,
    minimizeToTray: true,
    autoStart: false,
    dataRetentionDays: 30,
    debugMode: false,
    showDetailedStats: true,
    enableLogging: false
  })

  const isSettingsVisible = ref(false)

  // 显示/隐藏设置页面
  const showSettings = () => {
    isSettingsVisible.value = true
  }

  const hideSettings = () => {
    isSettingsVisible.value = false
  }

  const toggleSettings = () => {
    isSettingsVisible.value = !isSettingsVisible.value
  }

  // 保存设置
  const saveSettings = async () => {
    try {
      if (window.api && window.api.saveSettings) {
        const result = await window.api.saveSettings(settings.value)
        
        if (result.success) {
          console.log('设置保存成功')
          return true
        } else {
          console.error('保存设置失败:', result.error)
          return false
        }
      }
      
      // 备用：保存到本地存储
      localStorage.setItem('appSettings', JSON.stringify(settings.value))
      return true
    } catch (error) {
      console.error('保存设置失败:', error)
      return false
    }
  }

  // 加载设置
  const loadSettings = async () => {
    try {
      if (window.api && window.api.getSettings) {
        const result = await window.api.getSettings()
        
        if (result.success && result.settings) {
          Object.assign(settings.value, result.settings)
          return result.settings
        }
      }
      
      // 备用：从本地存储加载
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        Object.assign(settings.value, parsed)
        return parsed
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
    return null
  }

  // 重置设置为默认值
  const resetSettings = () => {
    settings.value = {
      theme: 'dark',
      notifications: true,
      minimizeToTray: true,
      autoStart: false,
      dataRetentionDays: 30,
      debugMode: false,
      showDetailedStats: true,
      enableLogging: false
    }
  }

  // 导出设置
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `screen-time-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 导入设置
  const importSettings = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          Object.assign(settings.value, importedSettings)
          resolve(importedSettings)
        } catch {
          reject(new Error('无效的设置文件格式'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  return {
    settings,
    isSettingsVisible,
    showSettings,
    hideSettings,
    toggleSettings,
    saveSettings,
    loadSettings,
    resetSettings,
    exportSettings,
    importSettings
  }
}
