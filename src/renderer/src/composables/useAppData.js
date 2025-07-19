import { ref, reactive, computed } from 'vue'
import { getDateKey } from '../utils/dateUtils.js'

/**
 * 应用数据状态管理
 */
export function useAppData() {
  const weeklyAppData = reactive({})
  const isDataLoaded = ref(false)
  const dataLoadError = ref(null)
  const selectedDateOffset = ref(0)

  // 计算当前数据
  const appUsageData = computed(() => {
    const dateKey = getDateKey(selectedDateOffset.value)
    const dayData = weeklyAppData[dateKey]
    return dayData ? dayData.apps : []
  })

  // 计算总使用时间
  const totalUsageTime = computed(() => appUsageData.value.reduce((sum, app) => sum + app.time, 0))

  // 按类别分组
  const groupedByCategory = computed(() => {
    const grouped = {}
    appUsageData.value.forEach((app) => {
      if (!grouped[app.category]) {
        grouped[app.category] = []
      }
      grouped[app.category].push(app)
    })
    return grouped
  })

  // 加载应用使用数据
  const loadAppUsageData = async () => {
    try {
      if (window.api && window.api.getAppUsage) {
        const result = await window.api.getAppUsage()

        if (result.success) {
          Object.assign(weeklyAppData, result.data.weeklyData)
          isDataLoaded.value = true
          console.log('数据加载成功:', result.data)
          return result.data.settings
        } else {
          throw new Error(result.error || '加载数据失败')
        }
      }
    } catch (error) {
      console.error('获取应用使用数据失败:', error)
      dataLoadError.value = error.message
      loadDefaultData()
    }
  }

  // 加载默认数据（离线模式）
  const loadDefaultData = () => {
    const defaultWeeklyData = {
      // 今天数据
      [getDateKey(0)]: {
        apps: [
          { name: 'Safari', category: '社交网络', time: 420, color: '#007AFF', icon: '🌐' },
          { name: 'WeChat', category: '社交网络', time: 385, color: '#1AAD19', icon: '💬' },
          { name: 'Douyin', category: '娱乐', time: 340, color: '#FE2C55', icon: '🎵' },
          { name: 'Bilibili', category: '娱乐', time: 280, color: '#00A1D6', icon: '📺' },
          { name: 'Xcode', category: '效率', time: 260, color: '#147EFB', icon: '⚙️' },
          { name: 'QQ Music', category: '音乐', time: 180, color: '#31C27C', icon: '🎧' },
          { name: 'Chrome', category: '实用工具', time: 150, color: '#EA4335', icon: '🌍' },
          { name: 'QQ', category: '社交网络', time: 120, color: '#12B7F5', icon: '💭' }
        ]
      },
      // 昨天数据
      [getDateKey(1)]: {
        apps: [
          { name: 'VS Code', category: '效率', time: 480, color: '#147EFB', icon: '💻' },
          { name: 'Chrome', category: '实用工具', time: 360, color: '#EA4335', icon: '🌍' },
          { name: 'WeChat', category: '社交网络', time: 320, color: '#1AAD19', icon: '💬' },
          { name: 'Spotify', category: '音乐', time: 240, color: '#1DB954', icon: '🎧' },
          { name: 'Notion', category: '效率', time: 180, color: '#000000', icon: '📝' },
          { name: 'Safari', category: '实用工具', time: 160, color: '#007AFF', icon: '🌐' },
          { name: 'Figma', category: '效率', time: 140, color: '#F24E1E', icon: '🎨' }
        ]
      }
    }

    Object.assign(weeklyAppData, defaultWeeklyData)
    isDataLoaded.value = true
  }

  // 保存当前日期数据
  const saveDayData = async (dateOffset = selectedDateOffset.value) => {
    try {
      const dateKey = getDateKey(dateOffset)
      const dayData = {
        apps: appUsageData.value,
        totalTime: totalUsageTime.value,
        date: dateKey
      }

      if (window.api && window.api.saveDayData) {
        const result = await window.api.saveDayData(dateKey, dayData)

        if (result.success) {
          console.log('数据保存成功:', dateKey)
        } else {
          console.error('保存数据失败:', result.error)
        }
      }
    } catch (error) {
      console.error('保存日期数据失败:', error)
    }
  }

  // 日期导航功能
  const canGoBack = computed(() => selectedDateOffset.value < 6) // 最多查看7天前
  const canGoForward = computed(() => selectedDateOffset.value > 0) // 最早到今天

  const goToPreviousDay = () => {
    if (canGoBack.value) {
      selectedDateOffset.value++
    }
  }

  const goToNextDay = () => {
    if (canGoForward.value) {
      selectedDateOffset.value--
    }
  }

  const goToToday = () => {
    selectedDateOffset.value = 0
  }

  return {
    // 数据状态
    weeklyAppData,
    isDataLoaded,
    dataLoadError,
    selectedDateOffset,

    // 计算属性
    appUsageData,
    totalUsageTime,
    groupedByCategory,
    canGoBack,
    canGoForward,

    // 方法
    loadAppUsageData,
    loadDefaultData,
    saveDayData,
    goToPreviousDay,
    goToNextDay,
    goToToday
  }
}
