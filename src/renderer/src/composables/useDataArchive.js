import { ref } from 'vue'

/**
 * 数据存档管理 composable
 */
export function useDataArchive() {
  const archiveInfo = ref({
    totalDataSize: 0,
    archivedDataSize: 0,
    lastBackupTime: null,
    backupStatus: 'idle', // idle, backing, restoring, error
    autoBackupEnabled: true,
    backupFrequency: 'daily' // daily, weekly, monthly
  })

  // 获取存档信息
  const getArchiveInfo = async () => {
    try {
      if (window.api && window.api.getArchiveInfo) {
        const result = await window.api.getArchiveInfo()
        if (result.success) {
          Object.assign(archiveInfo.value, result.data)
        }
      }
    } catch (error) {
      console.error('获取存档信息失败:', error)
    }
  }

  // 创建备份
  const createBackup = async () => {
    try {
      archiveInfo.value.backupStatus = 'backing'
      
      if (window.api && window.api.createBackup) {
        const result = await window.api.createBackup()
        
        if (result.success) {
          archiveInfo.value.lastBackupTime = new Date().toISOString()
          archiveInfo.value.backupStatus = 'idle'
          return { success: true, filePath: result.filePath }
        } else {
          archiveInfo.value.backupStatus = 'error'
          throw new Error(result.error)
        }
      } else {
        // 浏览器环境的备用方案
        const data = await exportAllData()
        downloadBackup(data)
        archiveInfo.value.lastBackupTime = new Date().toISOString()
        archiveInfo.value.backupStatus = 'idle'
        return { success: true }
      }
    } catch (error) {
      archiveInfo.value.backupStatus = 'error'
      console.error('创建备份失败:', error)
      throw error
    }
  }

  // 恢复备份
  const restoreBackup = async (filePath) => {
    try {
      archiveInfo.value.backupStatus = 'restoring'
      
      if (window.api && window.api.restoreBackup) {
        const result = await window.api.restoreBackup(filePath)
        
        if (result.success) {
          archiveInfo.value.backupStatus = 'idle'
          return { success: true }
        } else {
          archiveInfo.value.backupStatus = 'error'
          throw new Error(result.error)
        }
      }
    } catch (error) {
      archiveInfo.value.backupStatus = 'error'
      console.error('恢复备份失败:', error)
      throw error
    }
  }

  // 导出所有数据
  const exportAllData = async () => {
    try {
      const data = {
        version: '1.0.0',
        exportTime: new Date().toISOString(),
        weeklyData: {},
        settings: {},
        userPreferences: {}
      }

      // 从本地存储获取数据
      const weeklyDataStr = localStorage.getItem('weeklyAppData')
      const settingsStr = localStorage.getItem('appSettings')
      
      if (weeklyDataStr) {
        data.weeklyData = JSON.parse(weeklyDataStr)
      }
      
      if (settingsStr) {
        data.settings = JSON.parse(settingsStr)
      }

      return data
    } catch (error) {
      console.error('导出数据失败:', error)
      throw error
    }
  }

  // 导入数据
  const importData = async (data) => {
    try {
      if (!data.version) {
        throw new Error('无效的备份文件格式')
      }

      // 恢复数据到本地存储
      if (data.weeklyData) {
        localStorage.setItem('weeklyAppData', JSON.stringify(data.weeklyData))
      }
      
      if (data.settings) {
        localStorage.setItem('appSettings', JSON.stringify(data.settings))
      }

      return { success: true }
    } catch (error) {
      console.error('导入数据失败:', error)
      throw error
    }
  }

  // 下载备份文件
  const downloadBackup = (data) => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `screen-time-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 清空所有数据
  const clearAllData = async () => {
    try {
      if (window.api && window.api.clearAllData) {
        const result = await window.api.clearAllData()
        if (result.success) {
          return { success: true }
        } else {
          throw new Error(result.error)
        }
      } else {
        // 浏览器环境的备用方案
        localStorage.removeItem('weeklyAppData')
        localStorage.removeItem('appSettings')
        return { success: true }
      }
    } catch (error) {
      console.error('清空数据失败:', error)
      throw error
    }
  }

  // 获取数据统计信息
  const getDataStats = () => {
    try {
      const stats = {
        totalRecords: 0,
        oldestRecord: null,
        newestRecord: null,
        dataSize: 0
      }

      const weeklyDataStr = localStorage.getItem('weeklyAppData')
      if (weeklyDataStr) {
        const weeklyData = JSON.parse(weeklyDataStr)
        const dates = Object.keys(weeklyData)
        
        stats.totalRecords = dates.length
        stats.dataSize = new Blob([weeklyDataStr]).size
        
        if (dates.length > 0) {
          dates.sort()
          stats.oldestRecord = dates[0]
          stats.newestRecord = dates[dates.length - 1]
        }
      }

      return stats
    } catch (error) {
      console.error('获取数据统计失败:', error)
      return {
        totalRecords: 0,
        oldestRecord: null,
        newestRecord: null,
        dataSize: 0
      }
    }
  }

  // 保存存档设置
  const saveArchiveSettings = async () => {
    try {
      const settingsToSave = {
        autoBackupEnabled: archiveInfo.value.autoBackupEnabled,
        backupFrequency: archiveInfo.value.backupFrequency
      }
      
      localStorage.setItem('archiveSettings', JSON.stringify(settingsToSave))
      return true
    } catch (error) {
      console.error('保存存档设置失败:', error)
      return false
    }
  }

  // 加载存档设置
  const loadArchiveSettings = async () => {
    try {
      const saved = localStorage.getItem('archiveSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        Object.assign(archiveInfo.value, settings)
      }
    } catch (error) {
      console.error('加载存档设置失败:', error)
    }
  }

  return {
    archiveInfo,
    getArchiveInfo,
    createBackup,
    restoreBackup,
    exportAllData,
    importData,
    downloadBackup,
    clearAllData,
    getDataStats,
    saveArchiveSettings,
    loadArchiveSettings
  }
}
