/**
 * 自动保存模块
 * 负责定时自动保存应用使用数据
 */

import { Logger } from '../utils/logger.js'

class AutoSaver {
  constructor(dataStorage, appDetector) {
    this.dataStorage = dataStorage
    this.appDetector = appDetector
    this.autoSaveInterval = null
    this.lastAutoSave = Date.now()
    this.interval = 1 * 60 * 1000 // 1分钟自动保存一次 (测试用)
  }

  /**
   * 自动保存当前使用数据到文件
   */
  async saveUsageData() {
    try {
      Logger.info('Starting auto-save of usage data...')
      
      // 获取当前日期作为键
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      // 加载现有数据
      const existingData = await this.dataStorage.loadData()
      
      // 获取今日应用数据
      const todayApps = this.appDetector.getUsageData()
      
      // 更新今日数据
      if (todayApps.length > 0) {
        const totalTime = todayApps.reduce((sum, app) => sum + app.time, 0)
        existingData.weeklyData[today] = {
          apps: todayApps,
          totalTime: totalTime,
          date: today
        }
        existingData.lastUpdated = new Date().toISOString()
        
        // 保存数据
        const result = await this.dataStorage.saveData(existingData)
        if (result.success) {
          Logger.success(`Auto-saved ${todayApps.length} apps with total time ${totalTime}s`)
          this.lastAutoSave = Date.now()
        } else {
          Logger.error('Auto-save failed:', result.error)
        }
      } else {
        Logger.info('No usage data to auto-save')
        Logger.info(`Last auto-save: ${new Date(this.lastAutoSave).toLocaleTimeString()}`)
      }
    } catch (error) {
      Logger.error('Auto-save error:', error)
    }
  }

  /**
   * 启动自动保存定时器
   */
  start() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    
    this.autoSaveInterval = setInterval(() => this.saveUsageData(), this.interval)
    Logger.start(`Auto-save started: saving every ${this.interval / 1000 / 60} minutes`)
  }

  /**
   * 停止自动保存定时器
   */
  stop() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
      Logger.stop('Auto-save stopped')
    }
  }

  /**
   * 获取自动保存状态信息
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      success: true,
      isActive: this.autoSaveInterval !== null,
      interval: this.interval,
      lastSave: this.lastAutoSave,
      lastSaveFormatted: new Date(this.lastAutoSave).toLocaleString(),
      nextSave: this.lastAutoSave + this.interval,
      nextSaveFormatted: new Date(this.lastAutoSave + this.interval).toLocaleString()
    }
  }

  /**
   * 设置自动保存间隔
   * @param {number} minutes 间隔分钟数
   */
  setInterval(minutes) {
    this.interval = minutes * 60 * 1000
    if (this.autoSaveInterval) {
      this.stop()
      this.start()
    }
  }
}

export { AutoSaver }
