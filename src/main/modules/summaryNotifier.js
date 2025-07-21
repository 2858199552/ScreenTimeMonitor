/**
 * 统计摘要通知模块
 * 负责显示昨日使用统计的通知消息
 */

import { Logger } from '../utils/logger.js'

class SummaryNotifier {
  constructor(dataStorage, windowManager) {
    this.dataStorage = dataStorage
    this.windowManager = windowManager
  }

  /**
   * 显示昨日统计摘要通知
   */
  async showYesterdaySummary() {
    try {
      let summary = await this.dataStorage.getYesterdaySummary()
      
      // 如果没有昨日数据，检查是否需要生成测试数据
      if (!summary && process.env.NODE_ENV === 'development') {
        summary = await this._generateTestData()
      }
      
      if (!summary) {
        this._showWelcomeMessage()
        return
      }

      this._showSummaryNotification(summary)
    } catch (error) {
      Logger.error('Failed to show yesterday summary:', error)
    }
  }

  /**
   * 生成测试数据（仅开发模式）
   * @returns {Object|null} 昨日统计摘要
   * @private
   */
  async _generateTestData() {
    try {
      const testData = await this.dataStorage.loadData()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayKey = yesterday.toISOString().split('T')[0]
      
      // 添加测试的昨日数据
      testData.weeklyData[yesterdayKey] = {
        apps: [
          { name: 'VS Code', category: '效率', time: 285, color: '#147EFB', icon: '💻' },
          { name: 'Chrome', category: '实用工具', time: 180, color: '#EA4335', icon: '🌍' },
          { name: 'WeChat', category: '社交网络', time: 125, color: '#1AAD19', icon: '💬' }
        ],
        totalTime: 590,
        date: yesterdayKey
      }
      
      await this.dataStorage.saveData(testData)
      Logger.info('Generated test yesterday data for development')
      
      return await this.dataStorage.getYesterdaySummary()
    } catch (error) {
      Logger.error('Failed to generate test data:', error)
      return null
    }
  }

  /**
   * 显示欢迎消息
   * @private
   */
  _showWelcomeMessage() {
    const title = '👋 欢迎使用屏幕时间监控'
    const message =
      '应用已启动！\n从今天开始记录您的屏幕使用情况。\n明天将为您显示昨日统计数据。\n\n💡 点击此通知可打开应用窗口'
    
    setTimeout(() => {
      this.windowManager.showNotification(title, message)
      Logger.info('Welcome message shown - no yesterday data available')
    }, 2000)
  }

  /**
   * 显示昨日统计通知
   * @param {Object} summary 昨日统计摘要
   * @private
   */
  _showSummaryNotification(summary) {
    // 构建通知消息
    const topAppsText = summary.topApps
      .map((app) => `${app.icon} ${app.name} ${Math.floor(app.time / 60)}h${app.time % 60}m`)
      .join('\n')
    
    const title = '📊 昨日使用统计'
    const message = `总计使用: ${summary.timeText}\n最常用应用:\n${topAppsText}\n\n💡 点击此通知可打开应用窗口`
    
    // 延迟2秒显示通知，确保窗口已完全加载
    setTimeout(() => {
      this.windowManager.showNotification(title, message)
      Logger.info(
        `Yesterday summary shown: ${summary.timeText}, ${summary.topApps.length} top apps`
      )
    }, 2000)
  }
}

export { SummaryNotifier }
