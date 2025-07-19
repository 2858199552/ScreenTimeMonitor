/**
 * 日期处理工具函数
 */

// 获取日期键值 (YYYY-MM-DD)
export const getDateKey = (offset = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return date.toISOString().split('T')[0]
}

// 格式化日期显示
export const formatDate = (date) => {
  const today = new Date()
  const targetDate = new Date(date)

  // 计算天数差异
  const diffTime = today.getTime() - targetDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays === 2) {
    return '前天'
  } else if (diffDays <= 6) {
    return `${diffDays}天前`
  } else {
    return targetDate.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    })
  }
}

// 计算选中的实际日期
export const getSelectedDate = (offset) => {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return date
}
