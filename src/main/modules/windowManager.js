/**
 * 窗口管理模块
 * 负责主窗口和托盘的创建、管理和控制
 */

import { BrowserWindow, Tray, Menu, nativeImage, shell, app, Notification } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { Logger } from '../utils/logger.js'

class WindowManager {
  constructor(iconPath) {
    this.mainWindow = null
    this.tray = null
    this.iconPath = iconPath
  }

  /**
   * 创建主窗口
   * @returns {BrowserWindow} 创建的主窗口
   */
  createWindow() {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      icon: this.iconPath,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
      frame: process.platform !== 'win32',
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
      backgroundColor: '#1e1e1e',
      title: '⏱ 屏幕使用时间',
      minWidth: 800,
      minHeight: 600
    })

    // 阻止默认的关闭行为，改为最小化到托盘
    this.mainWindow.on('close', (event) => {
      if (!app.isQuiting) {
        event.preventDefault()
        this.mainWindow.hide()

        // 在 Windows 上显示托盘提示
        if (process.platform === 'win32' && this.tray) {
          this.tray.displayBalloon({
            iconType: 'info',
            title: '屏幕使用时间',
            content: '应用已最小化到系统托盘，点击托盘图标可重新打开'
          })
        }
      }
    })

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return this.mainWindow
  }

  /**
   * 创建系统托盘
   */
  createTray() {
    // 使用原始图标文件创建托盘图标
    const trayIconImage = nativeImage.createFromPath(this.iconPath).resize({ width: 16, height: 16 })

    this.tray = new Tray(trayIconImage)

    // 设置托盘提示文字
    this.tray.setToolTip('⏱ 屏幕使用时间 - 双击打开应用')

    // 创建托盘右键菜单
    this._createTrayMenu()

    // 托盘图标单击事件 - 切换窗口显示/隐藏
    this.tray.on('click', () => {
      this._toggleWindow()
    })

    // 托盘图标双击事件 - 总是显示窗口
    this.tray.on('double-click', () => {
      this._showWindow()
    })
  }

  /**
   * 创建托盘菜单
   * @private
   */
  _createTrayMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开主界面',
        click: () => this._showWindow()
      },
      {
        label: '隐藏窗口',
        enabled: this.mainWindow && this.mainWindow.isVisible(),
        click: () => this._hideWindow()
      },
      { type: 'separator' },
      {
        label: '今日使用报告',
        click: () => this._showReport()
      },
      {
        label: '应用统计',
        click: () => this._showWindow()
      },
      { type: 'separator' },
      {
        label: '偏好设置',
        click: () => this._showSettings()
      },
      {
        label: '开机自启',
        type: 'checkbox',
        checked: this.getAutoStartStatus(),
        click: (menuItem) => this._toggleAutoStart(menuItem.checked)
      },
      { type: 'separator' },
      {
        label: '刷新数据',
        click: () => this._refreshData()
      },
      { type: 'separator' },
      {
        label: '退出应用',
        click: () => this._quitApp()
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }

  /**
   * 显示窗口
   * @private
   */
  _showWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.show()
      this.mainWindow.focus()
    } else {
      this.createWindow()
    }
  }

  /**
   * 隐藏窗口
   * @private
   */
  _hideWindow() {
    if (this.mainWindow && this.mainWindow.isVisible()) {
      this.mainWindow.hide()
    }
  }

  /**
   * 切换窗口显示状态
   * @private
   */
  _toggleWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isVisible()) {
        this._hideWindow()
      } else {
        this._showWindow()
      }
    } else {
      this.createWindow()
    }
  }

  /**
   * 显示报告页面
   * @private
   */
  _showReport() {
    this._showWindow()
    if (this.mainWindow) {
      this.mainWindow.webContents.send('show-report')
    }
  }

  /**
   * 显示设置页面
   * @private
   */
  _showSettings() {
    this._showWindow()
    if (this.mainWindow) {
      this.mainWindow.webContents.send('show-settings')
    }
  }

  /**
   * 刷新数据
   * @private
   */
  _refreshData() {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('refresh-data')
    }
  }

  /**
   * 切换开机自启
   * @private
   */
  _toggleAutoStart(checked) {
    this.setAutoStart(checked)
    
    // 显示状态通知
    if (this.tray && process.platform === 'win32') {
      this.tray.displayBalloon({
        iconType: 'info',
        title: '设置已更新',
        content: checked ? '已开启开机自启动' : '已关闭开机自启动'
      })
    }
  }

  /**
   * 退出应用
   * @private
   */
  _quitApp() {
    app.isQuiting = true
    app.quit()
  }

  /**
   * 最小化窗口
   */
  minimize() {
    if (this.mainWindow) {
      this.mainWindow.minimize()
    }
  }

  /**
   * 最大化/还原窗口
   */
  maximize() {
    if (this.mainWindow) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow.maximize()
      }
    }
  }

  /**
   * 隐藏窗口
   */
  hide() {
    if (this.mainWindow) {
      this.mainWindow.hide()
    }
  }

  /**
   * 显示通知
   * @param {string} title 标题
   * @param {string} body 内容
   */
  showNotification(title, body) {
    try {
      // Windows: 使用托盘气球通知
      if (this.tray && process.platform === 'win32') {
        this.tray.displayBalloon({
          iconType: 'info',
          title: title,
          content: body
        })
        
        // 为托盘气球通知添加点击事件
        this.tray.once('balloon-click', () => {
          this._showWindow()
          Logger.info('User clicked on balloon notification, showing main window')
        })
      } else {
        // macOS 和 Linux: 使用系统通知
        if (Notification.isSupported()) {
          const notification = new Notification({
            title: title,
            body: body,
            icon: this.iconPath,
            silent: false
          })
          
          // 为系统通知添加点击事件
          notification.on('click', () => {
            this._showWindow()
            Logger.info('User clicked on system notification, showing main window')
          })
          
          notification.show()
        } else {
          Logger.warning('System notifications are not supported on this platform')
        }
      }
    } catch (error) {
      Logger.error('Failed to show notification:', error)
    }
  }

  /**
   * 获取开机自启状态
   * @returns {boolean} 是否开机自启
   */
  getAutoStartStatus() {
    return app.getLoginItemSettings().openAtLogin
  }

  /**
   * 设置开机自启
   * @param {boolean} enable 是否启用
   */
  setAutoStart(enable) {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: true,
      name: '屏幕使用时间'
    })
    
    // 更新托盘菜单以反映新的自启动状态
    // this._createTrayMenu()
  }

  /**
   * 获取主窗口实例
   * @returns {BrowserWindow|null} 主窗口实例
   */
  getMainWindow() {
    return this.mainWindow
  }

  /**
   * 销毁窗口和托盘
   */
  destroy() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
    
    if (this.mainWindow) {
      this.mainWindow.destroy()
      this.mainWindow = null
    }
  }
}

export { WindowManager }
