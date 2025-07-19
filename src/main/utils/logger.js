/**
 * 日志工具模块
 * 提供带颜色的控制台日志输出
 */

class Logger {
  // 颜色代码
  static colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  }

  // 符号 - 使用ASCII字符替代表情符号，确保兼容性
  static symbols = {
    success: '[SUCCESS]',
    error: '[ERROR]',
    warning: '[WARNING]',
    info: '[INFO]',
    save: '[SAVE]',
    start: '[START]',
    stop: '[STOP]',
    quit: '[QUIT]'
  }

  /**
   * 格式化带颜色的消息
   * @param {string} color 颜色代码
   * @param {string} symbol 符号
   * @param {string} message 消息内容
   * @returns {string} 格式化的消息
   */
  static format(color, symbol, message) {
    return `${color}${symbol} ${message}${Logger.colors.reset}`
  }

  /**
   * 成功日志 - 绿色
   */
  static success(message) {
    console.log(Logger.format(Logger.colors.green, Logger.symbols.success, message))
  }

  /**
   * 错误日志 - 红色
   */
  static error(message, error = null) {
    console.error(Logger.format(Logger.colors.red, Logger.symbols.error, message))
    if (error) {
      console.error(error)
    }
  }

  /**
   * 警告日志 - 黄色
   */
  static warning(message) {
    console.log(Logger.format(Logger.colors.yellow, Logger.symbols.warning, message))
  }

  /**
   * 信息日志 - 青色
   */
  static info(message) {
    console.log(Logger.format(Logger.colors.cyan, Logger.symbols.info, message))
  }

  /**
   * 保存日志 - 绿色
   */
  static save(message) {
    console.log(Logger.format(Logger.colors.green, Logger.symbols.save, message))
  }

  /**
   * 启动日志 - 绿色
   */
  static start(message) {
    console.log(Logger.format(Logger.colors.green, Logger.symbols.start, message))
  }

  /**
   * 停止日志 - 黄色
   */
  static stop(message) {
    console.log(Logger.format(Logger.colors.yellow, Logger.symbols.stop, message))
  }

  /**
   * 退出日志 - 青色
   */
  static quit(message) {
    console.log(Logger.format(Logger.colors.cyan, Logger.symbols.quit, message))
  }

  /**
   * 普通日志
   */
  static log(message) {
    console.log(message)
  }
}

export { Logger }
