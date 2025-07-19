<template>
  <header class="app-header">
    <div class="header-left">
      <h1 class="app-title">⏱ 屏幕使用时间</h1>
    </div>

    <div class="header-right">
      <!-- 日期导航控件 -->
      <div class="date-navigation">
        <button
          class="nav-btn"
          :disabled="!canGoBack"
          @click="$emit('goToPreviousDay')"
          title="查看前一天"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div
          class="date-selector"
          @click="$emit('goToToday')"
          style="cursor: pointer"
          title="回到今天"
        >
          <span class="date-text">{{ dateText }}</span>
        </div>

        <button
          class="nav-btn"
          :disabled="!canGoForward"
          @click="$emit('goToNextDay')"
          title="查看后一天"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 主题切换开关 -->
      <div class="theme-toggle">
        <button
          class="theme-btn"
          :class="{ active: !isDarkTheme }"
          :title="isDarkTheme ? '切换到浅色主题' : '切换到深色主题'"
          @click="$emit('toggleTheme')"
        >
          <!-- 深色主题时显示太阳图标 -->
          <svg
            v-if="isDarkTheme"
            class="theme-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
            <path
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              d="M12 1v2m6.36 1.64-1.42 1.42M21 12h2M19.78 17.22l-1.42-1.42M12 21v2m-4.95-1.64-1.42-1.42M1 12h2m2.22-4.95 1.42-1.42"
            />
          </svg>
          <!-- 浅色主题时显示月亮图标 -->
          <svg v-else class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>

      <div class="window-controls">
        <button class="window-btn" title="最小化" @click="$emit('minimizeWindow')">−</button>
        <button class="window-btn" title="最大化" @click="$emit('maximizeWindow')">□</button>
        <button class="window-btn close" title="关闭" @click="$emit('hideWindow')">×</button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  canGoBack: {
    type: Boolean,
    required: true
  },
  canGoForward: {
    type: Boolean,
    required: true
  },
  dateText: {
    type: String,
    required: true
  },
  isDarkTheme: {
    type: Boolean,
    required: true
  }
})

defineEmits([
  'goToPreviousDay',
  'goToNextDay',
  'goToToday',
  'toggleTheme',
  'minimizeWindow',
  'maximizeWindow',
  'hideWindow'
])
</script>
