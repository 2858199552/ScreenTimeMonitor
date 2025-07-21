/**
 * 主进程入口文件
 * 屏幕使用时间监控应用
 */

import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 导入模块化组件
import { Logger } from './utils/logger.js'
import { AppDetector } from './modules/appDetector.js'
import { DataStorage } from './modules/dataStorage.js'
import { AutoSaver } from './modules/autoSaver.js'
import { WindowManager } from './modules/windowManager.js'
import { IPCHandler } from './modules/ipcHandler.js'
import { SummaryNotifier } from './modules/summaryNotifier.js'

// 全局实例
let appDetector = null
let dataStorage = null
let autoSaver = null
let windowManager = null
let ipcHandler = null
let summaryNotifier = null

/**
 * 初始化应用
 */
function initializeApp() {
  // 创建核心模块实例
  appDetector = new AppDetector()
  dataStorage = new DataStorage()
  autoSaver = new AutoSaver(dataStorage, appDetector)
  windowManager = new WindowManager(icon)
  ipcHandler = new IPCHandler(appDetector, dataStorage, autoSaver, windowManager)
  summaryNotifier = new SummaryNotifier(dataStorage, windowManager)

  // 注册IPC处理器
  ipcHandler.registerHandlers()

  // 创建托盘
  windowManager.createTray()

  // 启动自动保存
  autoSaver.start()

  Logger.success('Application initialized successfully')
}

/**
 * 应用退出前的清理工作
 */
function cleanupBeforeQuit() {
  Logger.quit('Application is quitting, performing final save...')
  app.isQuiting = true
  
  // 停止自动保存定时器
  if (autoSaver) {
    autoSaver.stop()
  }
  
  // 执行最终保存
  if (autoSaver) {
    autoSaver.saveUsageData().catch((error) => {
      Logger.error('Final save failed:', error)
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.screentime')

  // 初始化应用
  initializeApp()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 创建主窗口
  windowManager.createWindow()

  // 显示昨日统计摘要（在窗口创建后）
  summaryNotifier.showYesterdaySummary()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow()
    } else {
      const mainWindow = windowManager.getMainWindow()
      if (mainWindow) {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
})

// 防止应用在所有窗口关闭时退出
app.on('window-all-closed', () => {
  // 在所有平台上都保持应用运行（包括 macOS）
  // 用户需要通过托盘菜单或快捷键显式退出
})

// 防止多实例运行
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，将焦点转到第一个实例的窗口
    const mainWindow = windowManager?.getMainWindow()
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// 在应用退出前清理资源
app.on('before-quit', cleanupBeforeQuit)

// 处理系统关机/重启时的清理
app.on('will-quit', (event) => {
  if (!app.isQuiting) {
    event.preventDefault()
  }
})
