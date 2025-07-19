import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 屏幕使用时间相关 API
  getAppUsage: () => ipcRenderer.invoke('get-app-usage'),
  saveAppUsage: (usageData) => ipcRenderer.invoke('save-app-usage', usageData),

  // 正在运行的应用 API
  getRunningApps: () => ipcRenderer.invoke('get-running-apps'),

  // 日期数据相关 API
  getDayData: (dateString) => ipcRenderer.invoke('get-day-data', dateString),
  saveDayData: (dateString, dayData) => ipcRenderer.invoke('save-day-data', dateString, dayData),

  // 数据管理 API
  getDataInfo: () => ipcRenderer.invoke('get-data-info'),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: (importData) => ipcRenderer.invoke('import-data', importData),

  // 系统相关 API
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),

  // 应用设置相关 API
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // 通知相关 API
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  // 托盘菜单功能
  showReport: () => ipcRenderer.invoke('show-report'),
  showSettings: () => ipcRenderer.invoke('show-settings'),
  refreshData: () => ipcRenderer.invoke('refresh-data'),

  // 监听托盘菜单事件
  onShowReport: (callback) => ipcRenderer.on('show-report', callback),
  onShowSettings: (callback) => ipcRenderer.on('show-settings', callback),
  onRefreshData: (callback) => ipcRenderer.on('refresh-data', callback),

  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
