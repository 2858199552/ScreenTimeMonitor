import { ref } from 'vue'

/**
 * 正在运行的应用监控 composable
 */
export function useRunningApps() {
  const runningApps = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // 获取正在运行的应用
  const fetchRunningApps = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (window.api && window.api.getRunningApps) {
        const result = await window.api.getRunningApps()
        console.log('后端返回结果:', result)
        
        if (result.success && result.apps && result.apps.length > 0) {
          runningApps.value = result.apps
          lastUpdated.value = new Date(result.timestamp)
        } else {
          // 如果后端没有返回应用，显示空列表
          console.log('后端未返回有效应用，显示空列表')
          runningApps.value = []
          lastUpdated.value = new Date()
        }
      } else {
        // 浏览器环境显示空列表
        runningApps.value = []
        lastUpdated.value = new Date()
      }
    } catch (err) {
      error.value = err.message
      console.error('获取正在运行的应用失败:', err)
      // 出错时也显示模拟数据
      runningApps.value = generateMockRunningApps()
      lastUpdated.value = new Date()
    } finally {
      isLoading.value = false
    }
  }

  // 生成模拟的正在运行应用数据（用于浏览器环境测试）
  const generateMockRunningApps = () => {
    return [
      {
        name: 'Visual Studio Code',
        pid: 12345,
        cpu: 5.2,
        memory: 245,
        memoryPercent: 3.1,
        command: 'Code.exe',
        started: new Date(Date.now() - 3600000).toLocaleTimeString()
      },
      {
        name: 'Google Chrome',
        pid: 23456,
        cpu: 12.8,
        memory: 512,
        memoryPercent: 6.4,
        command: 'chrome.exe',
        started: new Date(Date.now() - 7200000).toLocaleTimeString()
      },
      {
        name: 'Spotify',
        pid: 34567,
        cpu: 2.1,
        memory: 128,
        memoryPercent: 1.6,
        command: 'Spotify.exe',
        started: new Date(Date.now() - 5400000).toLocaleTimeString()
      },
      {
        name: 'Discord',
        pid: 45678,
        cpu: 1.5,
        memory: 89,
        memoryPercent: 1.1,
        command: 'Discord.exe',
        started: new Date(Date.now() - 1800000).toLocaleTimeString()
      },
      {
        name: 'Electron',
        pid: 56789,
        cpu: 8.3,
        memory: 156,
        memoryPercent: 2.0,
        command: 'electron.exe',
        started: new Date(Date.now() - 600000).toLocaleTimeString()
      }
    ]
  }

  // 获取应用图标（基于应用名称）
  const getAppIcon = (appName) => {
    const iconMap = {
      'Visual Studio Code': '💻',
      'Code': '💻',
      'Google Chrome': '🌐',
      'Chrome': '🌐',
      'Firefox': '🦊',
      'Safari': '🧭',
      'Edge': '🔵',
      'Spotify': '🎵',
      'iTunes': '🎵',
      'Discord': '💬',
      'Slack': '💼',
      'Teams': '📞',
      'Zoom': '📹',
      'Photoshop': '🎨',
      'Illustrator': '🎨',
      'Figma': '🎨',
      'Word': '📝',
      'Excel': '📊',
      'PowerPoint': '📊',
      'Notion': '📋',
      'Obsidian': '📋',
      'Steam': '🎮',
      'WeChat': '💬',
      'QQ': '🐧',
      'Electron': '⚡'
    }

    // 尝试匹配应用名称
    for (const [key, icon] of Object.entries(iconMap)) {
      if (appName.toLowerCase().includes(key.toLowerCase())) {
        return icon
      }
    }

    return '📱' // 默认图标
  }

  // 获取应用类别
  const getAppCategory = (appName) => {
    const categoryMap = {
      'Visual Studio Code': '开发工具',
      'Code': '开发工具',
      'Google Chrome': '浏览器',
      'Chrome': '浏览器',
      'Firefox': '浏览器',
      'Safari': '浏览器',
      'Edge': '浏览器',
      'Spotify': '音乐',
      'iTunes': '音乐',
      'Discord': '社交',
      'Slack': '工作',
      'Teams': '工作',
      'Zoom': '视频会议',
      'Photoshop': '设计',
      'Illustrator': '设计',
      'Figma': '设计',
      'Word': '办公',
      'Excel': '办公',
      'PowerPoint': '办公',
      'Notion': '笔记',
      'Obsidian': '笔记',
      'Steam': '游戏',
      'WeChat': '社交',
      'QQ': '社交'
    }

    // 尝试匹配应用名称
    for (const [key, category] of Object.entries(categoryMap)) {
      if (appName.toLowerCase().includes(key.toLowerCase())) {
        return category
      }
    }

    return '其他' // 默认类别
  }

  // 自动刷新正在运行的应用（可选）
  let refreshInterval = null

  const startAutoRefresh = (intervalMs = 10000) => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    
    refreshInterval = setInterval(() => {
      fetchRunningApps()
    }, intervalMs)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  return {
    runningApps,
    isLoading,
    error,
    lastUpdated,
    fetchRunningApps,
    getAppIcon,
    getAppCategory,
    startAutoRefresh,
    stopAutoRefresh
  }
}
