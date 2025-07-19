# API 文档

## 模块 API 参考

### Logger (日志工具)

#### 方法
```javascript
// 成功日志 - 绿色输出
Logger.success(message: string): void

// 错误日志 - 红色输出
Logger.error(message: string, error?: Error): void

// 警告日志 - 黄色输出
Logger.warning(message: string): void

// 信息日志 - 青色输出
Logger.info(message: string): void

// 保存日志 - 绿色输出
Logger.save(message: string): void

// 启动日志 - 绿色输出
Logger.start(message: string): void

// 停止日志 - 黄色输出
Logger.stop(message: string): void

// 退出日志 - 青色输出
Logger.quit(message: string): void

// 普通日志
Logger.log(message: string): void
```

### AppDetector (应用检测)

#### 构造函数
```javascript
new AppDetector()
```

#### 方法
```javascript
// 获取正在运行的应用
async getRunningApps(): Promise<{
  success: boolean
  apps: Array<{
    name: string
    pid: number
    windowTitle: string
    lastSeen: string
    firstSeen: string
    usageTime: number
    formattedUsageTime: string
    isActive: boolean
  }>
  timestamp: string
  error?: string
}>

// 判断是否为自身应用
isSelfApplication(activeWindow: Object): boolean

// 清理应用名称
getCleanAppName(name: string): string

// 格式化使用时间
formatUsageTime(seconds: number): string

// 获取使用数据
getUsageData(): Array<{
  name: string
  category: string
  time: number
  color: string
  icon: string
  pid: number
  lastSeen: string
  firstSeen: string
}>
```

### DataStorage (数据存储)

#### 构造函数
```javascript
new DataStorage()
```

#### 方法
```javascript
// 加载数据
async loadData(): Promise<{
  lastUpdated: string
  weeklyData: Object
  settings: Object
  statistics: Object
}>

// 保存数据
async saveData(data: Object): Promise<{
  success: boolean
  path?: string
  error?: string
}>

// 获取默认数据
getDefaultData(): Object

// 生成单日数据
generateDayData(dayOffset: number): Object

// 获取数据路径信息
getDataInfo(): {
  dataPath: string
  backupPath: string
  userDataPath: string
}
```

### AutoSaver (自动保存)

#### 构造函数
```javascript
new AutoSaver(dataStorage: DataStorage, appDetector: AppDetector)
```

#### 方法
```javascript
// 执行保存操作
async saveUsageData(): Promise<void>

// 启动自动保存
start(): void

// 停止自动保存
stop(): void

// 获取状态信息
getStatus(): {
  success: boolean
  isActive: boolean
  interval: number
  lastSave: number
  lastSaveFormatted: string
  nextSave: number
  nextSaveFormatted: string
}

// 设置保存间隔
setInterval(minutes: number): void
```

### WindowManager (窗口管理)

#### 构造函数
```javascript
new WindowManager(iconPath: string)
```

#### 方法
```javascript
// 创建主窗口
createWindow(): BrowserWindow

// 创建系统托盘
createTray(): void

// 最小化窗口
minimize(): void

// 最大化窗口
maximize(): void

// 隐藏窗口
hide(): void

// 显示通知
showNotification(title: string, body: string): void

// 获取开机自启状态
getAutoStartStatus(): boolean

// 设置开机自启
setAutoStart(enable: boolean): void

// 获取主窗口实例
getMainWindow(): BrowserWindow | null

// 销毁窗口和托盘
destroy(): void
```

### IPCHandler (IPC通信)

#### 构造函数
```javascript
new IPCHandler(
  appDetector: AppDetector,
  dataStorage: DataStorage,
  autoSaver: AutoSaver,
  windowManager: WindowManager
)
```

#### 方法
```javascript
// 注册所有IPC处理器
registerHandlers(): void
```

## IPC 接口参考

### 应用检测相关
```javascript
// 获取正在运行的应用
ipcRenderer.invoke('get-running-apps')

// 返回格式
{
  success: boolean
  apps: Array<AppInfo>
  timestamp: string
  error?: string
}
```

### 数据存储相关
```javascript
// 获取应用使用数据
ipcRenderer.invoke('get-app-usage')

// 保存应用使用数据
ipcRenderer.invoke('save-app-usage', usageData)

// 获取特定日期数据
ipcRenderer.invoke('get-day-data', dateString)

// 保存特定日期数据
ipcRenderer.invoke('save-day-data', dateString, dayData)

// 获取数据文件信息
ipcRenderer.invoke('get-data-info')

// 导出数据
ipcRenderer.invoke('export-data')

// 导入数据
ipcRenderer.invoke('import-data', importData)
```

### 自动保存相关
```javascript
// 手动触发保存
ipcRenderer.invoke('save-current-usage')

// 获取自动保存状态
ipcRenderer.invoke('get-auto-save-status')
```

### 窗口控制相关
```javascript
// 最小化窗口
ipcRenderer.invoke('minimize-window')

// 最大化窗口
ipcRenderer.invoke('maximize-window')

// 关闭窗口
ipcRenderer.invoke('close-window')
```

### 设置管理相关
```javascript
// 获取设置
ipcRenderer.invoke('get-settings')

// 保存设置
ipcRenderer.invoke('save-settings', settings)
```

### 通知相关
```javascript
// 显示通知
ipcRenderer.invoke('show-notification', title, body)
```

### 托盘菜单相关
```javascript
// 显示报告
ipcRenderer.invoke('show-report')

// 显示设置
ipcRenderer.invoke('show-settings')

// 刷新数据
ipcRenderer.invoke('refresh-data')
```

## 数据结构参考

### 应用信息 (AppInfo)
```typescript
interface AppInfo {
  name: string              // 应用名称
  pid: number              // 进程ID
  windowTitle: string      // 窗口标题
  lastSeen: string         // 最后出现时间
  firstSeen: string        // 首次发现时间
  usageTime: number        // 使用时长(秒)
  formattedUsageTime: string // 格式化时长
  isActive: boolean        // 是否当前活跃
}
```

### 使用数据 (UsageData)
```typescript
interface UsageData {
  name: string             // 应用名称
  category: string         // 应用分类
  time: number            // 使用时长(秒)
  color: string           // 显示颜色
  icon: string            // 应用图标
  pid: number             // 进程ID
  lastSeen: string        // 最后出现时间
  firstSeen: string       // 首次发现时间
}
```

### 存储格式 (StorageFormat)
```typescript
interface StorageFormat {
  lastUpdated: string     // 最后更新时间
  weeklyData: {          // 周数据
    [date: string]: {    // 日期 (YYYY-MM-DD)
      apps: UsageData[]  // 应用列表
      totalTime: number  // 总时长
      date: string       // 日期
    }
  }
  settings: {            // 设置
    autoStart: boolean   // 开机自启
    notifications: boolean // 通知
    minimizeToTray: boolean // 最小化到托盘
    theme: string        // 主题
  }
  statistics: {          // 统计信息
    totalDays: number    // 总天数
    totalTime: number    // 总时长
    averageDaily: number // 日均时长
  }
}
```

## 错误码参考

### 通用错误
- `MODULE_INIT_FAILED` - 模块初始化失败
- `INVALID_PARAMETER` - 参数无效
- `PERMISSION_DENIED` - 权限被拒绝

### 应用检测错误
- `ACTIVE_WIN_ERROR` - 活跃窗口检测失败
- `PROCESS_ACCESS_DENIED` - 进程访问被拒绝

### 数据存储错误
- `FILE_READ_ERROR` - 文件读取失败
- `FILE_WRITE_ERROR` - 文件写入失败
- `JSON_PARSE_ERROR` - JSON解析失败
- `BACKUP_FAILED` - 备份失败

### 自动保存错误
- `SAVE_INTERVAL_INVALID` - 保存间隔无效
- `SAVE_IN_PROGRESS` - 保存正在进行中
- `NO_DATA_TO_SAVE` - 没有数据需要保存

*文档版本：v2.0.0*
*最后更新：2025年7月19日*
