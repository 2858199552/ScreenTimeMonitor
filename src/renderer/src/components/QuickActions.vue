<template>
  <div class="quick-actions">
    <button class="action-btn">设置应用限制</button>
    <button class="action-btn secondary">查看详细报告</button>
    <button class="action-btn secondary" @click="$emit('showSettings')">⚙️ 应用设置</button>
    <button class="action-btn secondary" @click="$emit('hideWindow')">隐藏到托盘</button>
    <button class="action-btn secondary" @click="$emit('minimizeWindow')">最小化窗口</button>
    <button class="action-btn secondary" @click="$emit('showNotification')">测试通知</button>
    <button class="action-btn secondary" @click="$emit('refreshData')">刷新数据</button>
  </div>
</template>

<script setup>
defineEmits(['hideWindow', 'minimizeWindow', 'showNotification', 'refreshData', 'showSettings'])
</script>
