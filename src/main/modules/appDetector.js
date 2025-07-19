/**
 * 应用检测和管理模块
 * 负责检测活跃应用、排除自身应用、管理应用使用时间
 */

import activeWin from 'active-win'
import { Logger } from '../utils/logger.js'

class AppDetector {
  constructor() {
    this.knownApps = new Map()
    this.lastActiveWin = null
    this.appUsageTimes = new Map() // 存储应用使用时长 (pid -> 总秒数)
    this.lastUpdateTime = Date.now()
  }

  /**
   * 检查是否是自身应用
   * @param {Object} activeWindow 活跃窗口对象
   * @returns {boolean} 是否是自身应用
   */
  isSelfApplication(activeWindow) {
    if (!activeWindow || !activeWindow.owner) {
      return false
    }
    
    // 检查进程路径是否包含当前应用的可执行文件
    const path = activeWindow.owner.path || ''
    const currentProcessPath = process.execPath
    
    // 如果路径相同，说明是同一个应用
    if (path === currentProcessPath) {
      return true
    }
    
    // 检查是否是 Electron 开发模式下的应用
    if (path.includes('electron\\dist\\electron.exe') && activeWindow.title === 'Electron') {
      return true
    }
    
    // 检查应用名称是否是我们的应用
    const appName = activeWindow.owner.name || activeWindow.title || ''
    if (
      appName.includes('screen-time-monitor') ||
      appName.includes('ScreenTimeMonitor') ||
      appName === '屏幕使用时间' ||
      appName.includes('electron-app-js')
    ) {
      return true
    }
    
    return false
  }

  /**
   * 清理应用名称
   * @param {string} name 原始应用名称
   * @returns {string} 清理后的应用名称
   */
  getCleanAppName(name) {
    if (!name) return 'Unknown'
    
    // 移除 .exe 后缀
    const cleaned = name.replace(/\.exe$/i, '')
    
    // 常见应用名称映射
    const nameMap = {
      Code: 'Visual Studio Code',
      chrome: 'Google Chrome',
      firefox: 'Firefox',
      msedge: 'Microsoft Edge',
      'notepad++': 'Notepad++',
      explorer: 'Windows Explorer'
    }
    
    return nameMap[cleaned.toLowerCase()] || cleaned
  }

  /**
   * 格式化使用时长
   * @param {number} seconds 秒数
   * @returns {string} 格式化的时长字符串
   */
  formatUsageTime(seconds) {
    if (seconds < 60) {
      return `${seconds}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
    }
  }

  /**
   * 获取正在运行的应用程序
   * @returns {Object} 应用列表结果
   */
  async getRunningApps() {
    try {
      Logger.log('Starting to get running applications using active-win...')
      
      const currentTime = Date.now()
      const timeDiff = currentTime - this.lastUpdateTime
      
      // 获取当前活跃窗口
      const activeWindow = await activeWin()
      Logger.log('Current active window:', activeWindow ? activeWindow.title : 'None')
      
      // 检查是否是自身应用，如果是则跳过统计
      if (activeWindow && this.isSelfApplication(activeWindow)) {
        Logger.log('Detected self application, skipping statistics for:', activeWindow.title)
        // 更新时间戳但不记录自身应用
        this.lastUpdateTime = currentTime
        return this._getKnownAppsResult()
      }
      
      // 更新当前活跃应用的使用时长
      if (activeWindow && activeWindow.owner?.processId) {
        this._updateUsageTime(activeWindow.owner.processId, timeDiff)
      }
      
      // 记录当前活跃应用
      if (activeWindow) {
        this._recordActiveApp(activeWindow)
      }
      
      this.lastUpdateTime = currentTime
      
      return this._buildAppsList()
      
    } catch (error) {
      Logger.error('Failed to get running applications:', error)
      return {
        success: false,
        error: error.message,
        apps: []
      }
    }
  }

  /**
   * 更新应用使用时长
   * @private
   */
  _updateUsageTime(pid, timeDiff) {
    const currentUsage = this.appUsageTimes.get(pid) || 0
    const additionalSeconds = Math.floor(timeDiff / 1000)
    this.appUsageTimes.set(pid, currentUsage + additionalSeconds)
    Logger.log(`Updated usage time for PID ${pid}: +${additionalSeconds}s, total: ${currentUsage + additionalSeconds}s`)
  }

  /**
   * 记录活跃应用信息
   * @private
   */
  _recordActiveApp(activeWindow) {
    const appInfo = {
      name: activeWindow.title || activeWindow.owner?.name || 'Unknown',
      pid: activeWindow.owner?.processId || 0,
      windowTitle: activeWindow.title,
      ownerName: activeWindow.owner?.name,
      bundle: activeWindow.owner?.bundle,
      memoryUsage: activeWindow.memoryUsage || 0,
      bounds: activeWindow.bounds,
      path: activeWindow.owner?.path,
      lastSeen: new Date().toISOString(),
      firstSeen: new Date().toISOString()
    }
    
    const appKey = `${appInfo.pid}_${appInfo.ownerName || appInfo.name}`
    
    // 如果是新应用，保留首次发现时间
    if (this.knownApps.has(appKey)) {
      const existingApp = this.knownApps.get(appKey)
      appInfo.firstSeen = existingApp.firstSeen
    }
    
    this.knownApps.set(appKey, appInfo)
    this.lastActiveWin = activeWindow
    
    // 初始化使用时长（如果还没有记录）
    if (!this.appUsageTimes.has(appInfo.pid)) {
      this.appUsageTimes.set(appInfo.pid, 0)
    }
  }

  /**
   * 获取已知应用的结果（用于自身应用活跃时）
   * @private
   */
  _getKnownAppsResult() {
    const apps = []
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    
    // 清理过期应用
    for (const [appKey, app] of this.knownApps.entries()) {
      if (new Date(app.lastSeen).getTime() < fiveMinutesAgo) {
        this.knownApps.delete(appKey)
      }
    }
    
    // 转换已知应用为返回格式（排除自身）
    for (const [, app] of this.knownApps.entries()) {
      if (!this.isSelfApplication({ owner: { name: app.ownerName, path: app.path }, title: app.name })) {
        const usageTime = this.appUsageTimes.get(app.pid) || 0
        const appData = {
          name: this.getCleanAppName(app.ownerName || app.name),
          pid: app.pid,
          windowTitle: app.windowTitle,
          lastSeen: app.lastSeen,
          firstSeen: app.firstSeen,
          usageTime: usageTime,
          formattedUsageTime: this.formatUsageTime(usageTime),
          isActive: false // 当前活跃的是自身应用，所以其他应用都不活跃
        }
        apps.push(appData)
      }
    }
    
    apps.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    Logger.log('Final application count returned (excluding self):', apps.length)
    
    return {
      success: true,
      apps: apps.slice(0, 15),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 构建应用列表
   * @private
   */
  _buildAppsList() {
    const apps = []
    
    // 清理过期的应用（超过5分钟未见）
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    for (const [appKey, app] of this.knownApps.entries()) {
      if (new Date(app.lastSeen).getTime() < fiveMinutesAgo) {
        this.knownApps.delete(appKey)
      }
    }
    
    // 转换已知应用为返回格式（排除自身应用）
    for (const [, app] of this.knownApps.entries()) {
      const mockActiveWindow = { 
        owner: { name: app.ownerName, path: app.path }, 
        title: app.name 
      }
      if (this.isSelfApplication(mockActiveWindow)) {
        Logger.log(`Excluding self application from results: ${app.name}`)
        continue
      }
      
      const usageTime = this.appUsageTimes.get(app.pid) || 0
      const currentActiveWindow = this.lastActiveWin || {}
      const currentActivePid = currentActiveWindow.owner?.processId
      
      const appData = {
        name: this.getCleanAppName(app.ownerName || app.name),
        pid: app.pid,
        windowTitle: app.windowTitle,
        lastSeen: app.lastSeen,
        firstSeen: app.firstSeen,
        usageTime: usageTime,
        formattedUsageTime: this.formatUsageTime(usageTime),
        isActive: app.pid === currentActivePid && currentActivePid > 0
      }
      
      Logger.log(`App: ${app.name}, PID: ${app.pid}, Current Active PID: ${currentActivePid}, isActive: ${appData.isActive}`)
      
      apps.push(appData)
    }
    
    // 按最后活跃时间排序
    apps.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    
    Logger.log('Final application count returned:', apps.length)
    if (apps.length > 0) {
      Logger.log('Applications found:', apps
        .slice(0, 5)
        .map(app => `${app.name}(${app.formattedUsageTime}, ${app.isActive ? 'Active' : 'Background'})`)
      )
    } else {
      Logger.log('No applications found, returning empty result')
      return {
        success: true,
        apps: [],
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      success: true,
      apps: apps.slice(0, 15),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 获取所有应用的使用数据（用于保存）
   * @returns {Array} 应用使用数据数组
   */
  getUsageData() {
    const usageData = []
    
    for (const [, app] of this.knownApps.entries()) {
      // 排除自身应用
      const mockActiveWindow = { 
        owner: { name: app.ownerName, path: app.path }, 
        title: app.name 
      }
      if (this.isSelfApplication(mockActiveWindow)) {
        continue
      }
      
      const usageTime = this.appUsageTimes.get(app.pid) || 0
      if (usageTime > 0) { // 只返回有使用时间的应用
        usageData.push({
          name: this.getCleanAppName(app.ownerName || app.name),
          category: '其他', // 默认分类，可以后续优化
          time: usageTime,
          color: '#6366f1', // 默认颜色
          icon: '📱', // 默认图标
          pid: app.pid,
          lastSeen: app.lastSeen,
          firstSeen: app.firstSeen
        })
      }
    }
    
    return usageData
  }
}

export { AppDetector }
