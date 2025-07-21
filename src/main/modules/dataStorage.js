/**
 * 数据存储模块
 * 负责应用使用数据的持久化存储和管理
 */

import { promises as fs } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { Logger } from '../utils/logger.js'

class DataStorage {
  constructor() {
    this.dataPath = join(app.getPath('userData'), 'screen-time-data.json')
    this.backupPath = join(app.getPath('userData'), 'screen-time-data-backup.json')
  }

  /**
   * 读取数据
   * @returns {Object} 存储的数据对象
   */
  async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      Logger.warning(`Data file does not exist or read failed, using default data: ${error.message}`)
      return this.getDefaultData()
    }
  }

  /**
   * 保存数据
   * @param {Object} data 要保存的数据
   * @returns {Object} 保存结果
   */
  async saveData(data) {
    try {
      // 先备份现有数据
      try {
        await fs.copyFile(this.dataPath, this.backupPath)
      } catch (backupError) {
        Logger.warning(`Backup file failed (may be first save): ${backupError.message}`)
      }

      // 保存新数据
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf8')
      Logger.save(`Data saved to: ${this.dataPath}`)
      return { success: true, path: this.dataPath }
    } catch (error) {
      Logger.error('Failed to save data:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取默认数据
   * @returns {Object} 默认数据结构
   */
  getDefaultData() {
    const now = new Date()
    const defaultData = {
      lastUpdated: now.toISOString(),
      weeklyData: {},
      settings: {
        autoStart: false,
        notifications: true,
        minimizeToTray: true,
        theme: 'dark'
      },
      statistics: {
        totalDays: 0,
        totalTime: 0,
        averageDaily: 0
      }
    }

    // 生成过去7天的默认数据
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      defaultData.weeklyData[dateKey] = this.generateDayData(i)
    }

    return defaultData
  }

  /**
   * 生成单日数据
   * @param {number} dayOffset 天数偏移
   * @returns {Object} 单日数据
   */
  generateDayData(dayOffset) {
    const dataTemplates = [
      // 今天 (day 0)
      [
        { name: 'Safari', category: '社交网络', time: 420, color: '#007AFF', icon: '🌐' },
        { name: 'WeChat', category: '社交网络', time: 385, color: '#1AAD19', icon: '💬' },
        { name: 'Douyin', category: '娱乐', time: 340, color: '#FE2C55', icon: '🎵' },
        { name: 'Bilibili', category: '娱乐', time: 280, color: '#00A1D6', icon: '📺' },
        { name: 'Xcode', category: '效率', time: 260, color: '#147EFB', icon: '⚙️' },
        { name: 'QQ Music', category: '音乐', time: 180, color: '#31C27C', icon: '🎶' },
        { name: 'Chrome', category: '实用工具', time: 150, color: '#EA4335', icon: '🌍' },
        { name: 'QQ', category: '社交网络', time: 120, color: '#12B7F5', icon: '🐧' }
      ],
      // 昨天 (day 1)
      [
        { name: 'VS Code', category: '效率', time: 480, color: '#147EFB', icon: '💻' },
        { name: 'Chrome', category: '实用工具', time: 360, color: '#EA4335', icon: '🌍' },
        { name: 'WeChat', category: '社交网络', time: 320, color: '#1AAD19', icon: '💬' },
        { name: 'Spotify', category: '音乐', time: 240, color: '#1DB954', icon: '🎵' },
        { name: 'Notion', category: '效率', time: 180, color: '#000000', icon: '📝' },
        { name: 'Safari', category: '实用工具', time: 160, color: '#007AFF', icon: '🌐' },
        { name: 'Figma', category: '效率', time: 140, color: '#F24E1E', icon: '🎨' }
      ],
      // 其他天数的数据模板...
      [
        { name: 'Netflix', category: '娱乐', time: 380, color: '#E50914', icon: '🎬' },
        { name: 'Instagram', category: '社交网络', time: 290, color: '#E4405F', icon: '📷' },
        { name: 'YouTube', category: '娱乐', time: 260, color: '#FF0000', icon: '📺' },
        { name: 'Douyin', category: '娱乐', time: 220, color: '#FE2C55', icon: '🎵' },
        { name: 'WeChat', category: '社交网络', time: 180, color: '#1AAD19', icon: '💬' },
        { name: 'Safari', category: '实用工具', time: 140, color: '#007AFF', icon: '🌐' },
        { name: 'QQ Music', category: '音乐', time: 120, color: '#31C27C', icon: '🎶' }
      ]
    ]

    // 根据天数返回相应的数据模板，如果超出范围则随机选择
    const templateIndex = Math.min(dayOffset, dataTemplates.length - 1)
    return {
      apps: dataTemplates[templateIndex],
      totalTime: dataTemplates[templateIndex].reduce((sum, app) => sum + app.time, 0),
      date: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  }

  /**
   * 获取昨日统计数据摘要
   * @returns {Object|null} 昨日统计数据摘要或null
   */
  async getYesterdaySummary() {
    try {
      const data = await this.loadData()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayKey = yesterday.toISOString().split('T')[0]
      
      const yesterdayData = data.weeklyData[yesterdayKey]
      if (!yesterdayData || !yesterdayData.apps || yesterdayData.apps.length === 0) {
        return null
      }

      // 计算总使用时间（分钟）
      const totalMinutes = yesterdayData.totalTime || 0
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      
      // 获取最常用的应用（前3个）
      const topApps = yesterdayData.apps
        .sort((a, b) => b.time - a.time)
        .slice(0, 3)
        .map((app) => ({
          name: app.name,
          time: app.time,
          icon: app.icon || '📱'
        }))

      // 格式化时间显示
      let timeText = ''
      if (hours > 0 && minutes > 0) {
        timeText = `${hours}小时${minutes}分钟`
      } else if (hours > 0) {
        timeText = `${hours}小时`
      } else {
        timeText = `${minutes}分钟`
      }

      return {
        date: yesterdayKey,
        totalTime: totalMinutes,
        timeText: timeText,
        topApps: topApps,
        appCount: yesterdayData.apps.length
      }
    } catch (error) {
      Logger.error('Failed to get yesterday summary:', error)
      return null
    }
  }

  /**
   * 获取数据文件路径信息
   * @returns {Object} 路径信息
   */
  getDataInfo() {
    return {
      dataPath: this.dataPath,
      backupPath: this.backupPath,
      userDataPath: app.getPath('userData')
    }
  }
}

export { DataStorage }
