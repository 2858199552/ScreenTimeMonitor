/**
 * IPC处理器模块
 * 负责处理渲染进程与主进程之间的通信
 */

import { ipcMain } from 'electron'
import { Logger } from '../utils/logger.js'

class IPCHandler {
  constructor(appDetector, dataStorage, autoSaver, windowManager) {
    this.appDetector = appDetector
    this.dataStorage = dataStorage
    this.autoSaver = autoSaver
    this.windowManager = windowManager
  }

  /**
   * 注册所有IPC处理器
   */
  registerHandlers() {
    // 基础功能
    this._registerBasicHandlers()
    
    // 应用检测相关
    this._registerAppHandlers()
    
    // 数据存储相关
    this._registerDataHandlers()
    
    // 自动保存相关
    this._registerAutoSaveHandlers()
    
    // 窗口控制相关
    this._registerWindowHandlers()
    
    // 设置管理相关
    this._registerSettingsHandlers()
    
    // 通知相关
    this._registerNotificationHandlers()
  }

  /**
   * 注册基础处理器
   * @private
   */
  _registerBasicHandlers() {
    // IPC test
    ipcMain.on('ping', () => Logger.log('pong'))
    
    // 托盘菜单相关的IPC处理
    ipcMain.handle('show-report', () => {
      Logger.info('Show usage report')
      return { success: true }
    })

    ipcMain.handle('show-settings', () => {
      Logger.info('Show application settings')
      return { success: true }
    })

    ipcMain.handle('refresh-data', () => {
      Logger.info('Refresh application data')
      return { success: true }
    })
  }

  /**
   * 注册应用检测处理器
   * @private
   */
  _registerAppHandlers() {
    // 获取正在运行的应用
    ipcMain.handle('get-running-apps', async () => {
      return await this.appDetector.getRunningApps()
    })
  }

  /**
   * 注册数据存储处理器
   * @private
   */
  _registerDataHandlers() {
    // 获取应用使用数据
    ipcMain.handle('get-app-usage', async () => {
      try {
        const data = await this.dataStorage.loadData()
        return {
          success: true,
          data: data
        }
      } catch (error) {
        Logger.error('Failed to get app usage data:', error)
        return {
          success: false,
          error: error.message,
          data: this.dataStorage.getDefaultData()
        }
      }
    })

    // 保存应用使用数据
    ipcMain.handle('save-app-usage', async (event, usageData) => {
      try {
        const result = await this.dataStorage.saveData(usageData)
        return result
      } catch (error) {
        Logger.error('Failed to save app usage data:', error)
        return { success: false, error: error.message }
      }
    })

    // 获取特定日期的数据
    ipcMain.handle('get-day-data', async (event, dateString) => {
      try {
        const data = await this.dataStorage.loadData()
        const dayData = data.weeklyData[dateString]
        return {
          success: true,
          data: dayData || { apps: [], totalTime: 0, date: dateString }
        }
      } catch (error) {
        Logger.error('Failed to get date data:', error)
        return {
          success: false,
          error: error.message,
          data: { apps: [], totalTime: 0, date: dateString }
        }
      }
    })

    // 保存特定日期的数据
    ipcMain.handle('save-day-data', async (event, dateString, dayData) => {
      try {
        const data = await this.dataStorage.loadData()
        data.weeklyData[dateString] = dayData
        data.lastUpdated = new Date().toISOString()

        const result = await this.dataStorage.saveData(data)
        return result
      } catch (error) {
        Logger.error('Failed to save date data:', error)
        return { success: false, error: error.message }
      }
    })

    // 获取数据文件信息
    ipcMain.handle('get-data-info', () => {
      return this.dataStorage.getDataInfo()
    })

    // 导出数据
    ipcMain.handle('export-data', async () => {
      try {
        const data = await this.dataStorage.loadData()
        return {
          success: true,
          data: data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        Logger.error('Failed to export data:', error)
        return { success: false, error: error.message }
      }
    })

    // 导入数据
    ipcMain.handle('import-data', async (event, importData) => {
      try {
        // 验证导入数据的格式
        if (!importData.weeklyData || !importData.settings) {
          throw new Error('Invalid import data format')
        }

        const result = await this.dataStorage.saveData(importData)
        return result
      } catch (error) {
        Logger.error('Failed to import data:', error)
        return { success: false, error: error.message }
      }
    })
  }

  /**
   * 注册自动保存处理器
   * @private
   */
  _registerAutoSaveHandlers() {
    // 手动触发保存当前使用数据
    ipcMain.handle('save-current-usage', async () => {
      try {
        await this.autoSaver.saveUsageData()
        return { success: true, message: 'Usage data saved successfully' }
      } catch (error) {
        Logger.error('Manual save failed:', error)
        return { success: false, error: error.message }
      }
    })

    // 获取自动保存状态信息
    ipcMain.handle('get-auto-save-status', () => {
      return this.autoSaver.getStatus()
    })
  }

  /**
   * 注册窗口控制处理器
   * @private
   */
  _registerWindowHandlers() {
    // 窗口控制
    ipcMain.handle('minimize-window', () => {
      this.windowManager.minimize()
    })

    ipcMain.handle('maximize-window', () => {
      this.windowManager.maximize()
    })

    ipcMain.handle('close-window', () => {
      this.windowManager.hide()
    })
  }

  /**
   * 注册设置管理处理器
   * @private
   */
  _registerSettingsHandlers() {
    // 获取设置
    ipcMain.handle('get-settings', async () => {
      try {
        const data = await this.dataStorage.loadData()
        return {
          success: true,
          settings: {
            ...data.settings,
            autoStart: this.windowManager.getAutoStartStatus()
          }
        }
      } catch (error) {
        Logger.error('Failed to get settings:', error)
        return {
          success: false,
          error: error.message,
          settings: {
            autoStart: this.windowManager.getAutoStartStatus(),
            notifications: true,
            minimizeToTray: true,
            theme: 'dark'
          }
        }
      }
    })

    // 保存设置
    ipcMain.handle('save-settings', async (event, settings) => {
      try {
        // 保存开机启动设置到系统
        if (settings.autoStart !== undefined) {
          this.windowManager.setAutoStart(settings.autoStart)
        }

        // 保存其他设置到文件
        const data = await this.dataStorage.loadData()
        data.settings = { ...data.settings, ...settings }
        data.lastUpdated = new Date().toISOString()

        const result = await this.dataStorage.saveData(data)
        return result
      } catch (error) {
        Logger.error('Failed to save settings:', error)
        return { success: false, error: error.message }
      }
    })
  }

  /**
   * 注册通知处理器
   * @private
   */
  _registerNotificationHandlers() {
    // 通知
    ipcMain.handle('show-notification', (event, title, body) => {
      this.windowManager.showNotification(title, body)
      return { success: true }
    })
  }
}

export { IPCHandler }
