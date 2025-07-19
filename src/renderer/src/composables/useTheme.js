import { ref } from 'vue'

/**
 * 主题管理
 */
export function useTheme() {
  const isDarkTheme = ref(true) // 默认深色主题

  // 主题切换函数
  const toggleThemeClass = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark-theme')
      document.body.classList.remove('light-theme')
    } else {
      document.body.classList.add('light-theme')
      document.body.classList.remove('dark-theme')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value

    // 应用主题到 body 元素
    toggleThemeClass(isDarkTheme.value)

    // 保存主题设置到本地存储
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')

    console.log(`已切换到${isDarkTheme.value ? '深色' : '浅色'}主题`)
  }

  // 保存设置
  const saveSettings = async () => {
    try {
      if (window.api && window.api.saveSettings) {
        const settings = {
          theme: isDarkTheme.value ? 'dark' : 'light',
          notifications: true,
          minimizeToTray: true
        }

        const result = await window.api.saveSettings(settings)

        if (result.success) {
          console.log('设置保存成功')
        } else {
          console.error('保存设置失败:', result.error)
        }
      }
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkTheme.value = savedTheme === 'dark'
    }

    // 应用初始主题
    toggleThemeClass(isDarkTheme.value)
  }

  // 应用从服务端加载的设置
  const applySettings = (settings) => {
    if (settings && settings.theme) {
      isDarkTheme.value = settings.theme === 'dark'
      toggleThemeClass(isDarkTheme.value)
    }
  }

  return {
    isDarkTheme,
    toggleTheme,
    saveSettings,
    initTheme,
    applySettings
  }
}
