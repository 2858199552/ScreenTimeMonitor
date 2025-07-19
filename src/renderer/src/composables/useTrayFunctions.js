/**
 * 托盘功能管理
 */
export function useTrayFunctions() {
  // 测试托盘功能
  const minimizeWindow = async () => {
    try {
      if (window.api && window.api.minimize) {
        await window.api.minimize()
        console.log('窗口已最小化')
      }
    } catch (error) {
      console.error('最小化窗口失败:', error)
    }
  }

  const maximizeWindow = async () => {
    try {
      if (window.api && window.api.maximize) {
        await window.api.maximize()
        console.log('窗口状态已切换')
      }
    } catch (error) {
      console.error('切换窗口状态失败:', error)
    }
  }

  const hideWindow = async () => {
    try {
      if (window.api && window.api.close) {
        await window.api.close()
        console.log('窗口已隐藏到托盘')
      }
    } catch (error) {
      console.error('隐藏窗口失败:', error)
    }
  }

  const showNotification = async (totalUsageTime, formatTime) => {
    try {
      if (window.api && window.api.showNotification) {
        await window.api.showNotification(
          '屏幕使用时间提醒',
          '您今天已经使用设备 ' + formatTime(totalUsageTime) + ' 了！'
        )
        console.log('通知已发送')
      }
    } catch (error) {
      console.error('发送通知失败:', error)
    }
  }

  // 设置托盘事件监听
  const setupTrayListeners = (callbacks = {}) => {
    if (window.api && window.api.onShowReport) {
      window.api.onShowReport(() => {
        console.log('托盘菜单：显示报告')
        callbacks.onShowReport?.()
      })
    }

    if (window.api && window.api.onShowSettings) {
      window.api.onShowSettings(() => {
        console.log('托盘菜单：显示设置')
        callbacks.onShowSettings?.()
      })
    }

    if (window.api && window.api.onRefreshData) {
      window.api.onRefreshData(() => {
        console.log('托盘菜单：刷新数据')
        callbacks.onRefreshData?.()
      })
    }
  }

  return {
    minimizeWindow,
    maximizeWindow,
    hideWindow,
    showNotification,
    setupTrayListeners
  }
}
