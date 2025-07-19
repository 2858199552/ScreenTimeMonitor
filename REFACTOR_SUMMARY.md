# 屏幕使用时间应用重构总结

## 重构概述

我们成功将原本的单一 `App.vue` 文件重构为模块化的组件和功能模块，提高了代码的可维护性和可扩展性。

## 新增的模块结构

### 1. 工具函数 (utils/)

#### `dateUtils.js`
- `getDateKey()` - 获取日期键值
- `formatDate()` - 格式化日期显示
- `getSelectedDate()` - 计算选中的实际日期

#### `formatUtils.js`
- `formatTime()` - 格式化时间显示
- `getUsagePercentage()` - 获取使用时间占比

### 2. Composables (composables/)

#### `useAppData.js`
- 应用数据状态管理
- 数据加载、保存、默认数据
- 日期导航功能

#### `useTheme.js`
- 主题管理（深色/浅色主题）
- 主题切换和持久化
- 设置应用功能

#### `useTrayFunctions.js`
- 托盘相关功能
- 窗口控制（最小化、最大化、隐藏）
- 通知功能

#### `useSettings.js`
- 应用设置管理
- 设置的保存、加载、导入导出
- 设置面板显示控制

#### `useDebug.js`
- 调试功能管理
- 系统信息获取
- 日志记录和管理
- 调试工具（测试通知、错误、开发者工具等）

#### `useDataArchive.js`
- 数据存档管理
- 备份创建和恢复
- 数据导出和清空
- 数据统计信息

### 3. 组件 (components/)

#### `AppHeader.vue`
- 应用头部组件
- 日期导航控件
- 主题切换开关
- 窗口控制按钮

#### `TotalTimeCard.vue`
- 总使用时间卡片
- 时间图表显示

#### `AppUsageSection.vue`
- 应用使用详情组件
- 按类别分组显示
- 使用时间统计

#### `QuickActions.vue`
- 快速操作按钮组
- 包含设置、托盘、通知等功能

#### `SettingsPanel.vue`
- 设置面板组件
- 多标签页设计（基本设置、调试工具、数据存档）
- 完整的设置管理界面

### 4. 样式文件 (assets/)

#### `settings.css`
- 设置面板专用样式
- 响应式设计
- 深色主题适配

## 新增功能

### 设置页面
- **基本设置**：主题选择、通知开关、系统托盘、开机自启、数据保留设置
- **调试工具**：调试模式、日志记录、系统信息显示、调试操作（测试通知、测试错误、开发者工具、重新加载）
- **数据存档**：备份创建与恢复、数据导出、自动备份设置、数据统计

### 调试功能
- 系统信息收集（应用版本、平台、运行时间、内存使用）
- 实时日志记录和显示
- 日志导出功能
- 调试操作按钮

### 数据管理
- 数据备份和恢复
- 数据导入导出
- 数据统计信息
- 数据清空功能

## 代码优化

1. **模块化**：将大型组件拆分为多个小组件
2. **可复用性**：提取公共逻辑到 composables
3. **类型安全**：使用 PropTypes 和 EmitTypes
4. **样式管理**：使用 CSS 变量和模块化样式
5. **错误处理**：完善的错误捕获和日志记录

## 使用方式

### 打开设置页面
1. 点击快速操作区域的"⚙️ 应用设置"按钮
2. 通过系统托盘菜单的"显示设置"选项

### 设置页面功能
- **基本设置**：配置应用的基本行为
- **调试工具**：开发和问题排查工具
- **数据存档**：数据备份和管理功能

### 调试功能
- 启用调试模式查看详细信息
- 查看实时日志
- 导出日志用于问题分析
- 使用测试按钮验证功能

## 技术栈

- **Vue 3 Composition API**
- **响应式数据管理**
- **模块化组件设计**
- **CSS 变量主题系统**
- **本地存储持久化**

## 文件结构

```
src/renderer/src/
├── components/
│   ├── AppHeader.vue
│   ├── AppUsageSection.vue
│   ├── QuickActions.vue
│   ├── SettingsPanel.vue
│   └── TotalTimeCard.vue
├── composables/
│   ├── useAppData.js
│   ├── useDataArchive.js
│   ├── useDebug.js
│   ├── useSettings.js
│   ├── useTheme.js
│   └── useTrayFunctions.js
├── utils/
│   ├── dateUtils.js
│   └── formatUtils.js
├── assets/
│   ├── base.css
│   ├── main.css
│   ├── screen-time.css
│   └── settings.css
└── App.vue
```

这次重构大幅提升了代码的可维护性、可扩展性和用户体验，为后续功能开发奠定了良好的基础。
