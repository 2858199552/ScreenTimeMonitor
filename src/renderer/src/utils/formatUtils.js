/**
 * 格式化工具函数
 */

// 格式化时间显示
export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

// 获取使用时间占比
export const getUsagePercentage = (time, totalTime) => {
  return ((time / totalTime) * 100).toFixed(1)
}
