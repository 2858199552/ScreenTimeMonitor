# 📊 屏幕使用时间监控应用

一个基于 Electron + Vue 3 的桌面应用，用于监控和分析应用程序使用时间。

## ✨ 功能特性

- 🔍 **实时应用监控** - 自动检测当前活跃应用程序
- ⏰ **使用时间统计** - 精确记录每个应用的使用时长
- 💾 **自动数据保存** - 定时自动保存使用数据，防止数据丢失
- 🗂️ **数据可视化** - 直观的图表展示使用情况
- 🔔 **系统托盘** - 最小化到系统托盘，后台持续监控
- 🎨 **美观界面** - 现代化的 UI 设计
- 🌙 **深色主题** - 支持深色模式
- 📈 **统计分析** - 详细的使用报告和趋势分析

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 快速的前端构建工具
- **Electron** - 跨平台桌面应用框架

### 后端架构 (主进程)
- **模块化设计** - 清晰的代码结构
- **TypeScript支持** - 类型安全的开发体验
- **彩色日志系统** - 便于调试和监控

### 项目结构
```
screen-time-monitor/
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── index.js         # 入口文件
│   │   ├── utils/           # 工具模块
│   │   │   └── logger.js    # 日志系统
│   │   └── modules/         # 功能模块
│   │       ├── appDetector.js    # 应用检测
│   │       ├── dataStorage.js    # 数据存储
│   │       ├── autoSaver.js      # 自动保存
│   │       ├── windowManager.js  # 窗口管理
│   │       └── ipcHandler.js     # IPC通信
│   ├── preload/             # 预加载脚本
│   └── renderer/            # 渲染进程 (Vue应用)
├── docs/                    # 项目文档
├── build/                   # 构建资源
└── resources/               # 应用资源
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建应用
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 📖 文档

- [重构文档](./docs/REFACTORING.md) - 详细的架构重构说明
- [API文档](./docs/API.md) - 完整的API参考

## 🔧 主要功能

### 应用监控
- 实时检测当前活跃窗口
- 排除自身应用统计
- 支持多种应用类型识别
- 自动清理过期应用记录

### 数据管理
- JSON格式本地存储
- 自动备份机制
- 数据导入/导出功能
- 跨平台数据路径支持

### 用户界面
- 直观的使用时间展示
- 应用分类和图标
- 时间格式化显示
- 响应式设计

### 系统集成
- 系统托盘功能
- 开机自启选项
- 窗口最小化到托盘
- 系统通知支持

## 🎨 日志系统

应用采用彩色日志系统，便于调试和监控：

- 🟢 **[SUCCESS]** - 操作成功
- 🔴 **[ERROR]** - 错误信息
- 🟡 **[WARNING]** - 警告信息
- 🔵 **[INFO]** - 普通信息
- 🟢 **[SAVE]** - 数据保存
- 🟢 **[START]** - 功能启动
- 🟡 **[STOP]** - 功能停止

## ⚙️ 配置选项

### 应用设置
```json
{
  "autoStart": false,        // 开机自启
  "notifications": true,     // 系统通知
  "minimizeToTray": true,    // 最小化到托盘
  "theme": "dark"           // 主题设置
}
```

### 自动保存
- 默认间隔：1分钟 (开发模式)
- 生产环境：5分钟
- 支持手动保存
- 应用退出时自动保存

## 🔒 隐私和安全

- **本地存储** - 所有数据存储在本地，不上传到服务器
- **最小权限** - 仅获取必要的系统信息
- **数据加密** - 支持数据加密存储 (可选)
- **隐私模式** - 可排除特定应用的监控

## 🐛 问题排查

### 常见问题

#### 应用无法检测到活跃窗口
1. 检查系统权限设置
2. 确认 active-win 包正常工作
3. 查看日志输出中的错误信息

#### 自动保存不工作
1. 检查存储路径权限
2. 确认自动保存功能已启动
3. 查看 `[START] Auto-save started` 日志

#### 数据丢失
1. 检查备份文件
2. 查看数据存储路径
3. 确认应用正常退出

### 日志查看
开发模式下，在终端查看彩色日志输出：
```bash
npm run dev
# 观察日志输出，根据颜色快速识别问题
```

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范
- 使用 ES6+ 语法
- 遵循模块化原则
- 添加适当的注释
- 保持代码整洁

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📝 更新日志

### v2.0.0 (2025-07-19)
- ✨ **重大重构**: 将单体代码拆分为模块化架构
- 🎨 **新增**: 彩色日志系统，提升调试体验
- 🐛 **修复**: 表情符号兼容性问题
- ⚡ **优化**: 代码结构和性能优化
- 📚 **文档**: 完善项目文档

### v1.x
- 🚀 基础功能实现
- 📊 应用监控和时间统计
- 💾 数据存储功能
- 🔔 系统托盘支持

## 📄 许可证

MIT License

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [active-win](https://github.com/sindresorhus/active-win) - 活跃窗口检测
- [Vite](https://vitejs.dev/) - 快速的前端构建工具

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！

### ⚙️ 设置与配置
- **基本设置**：主题、通知、自启动等个性化配置
- **数据管理**：设置数据保留天数，自动清理过期数据
- **通知提醒**：使用时间达到预设值时智能提醒

### 🛠️ 调试与开发
- **调试工具**：内置调试面板，查看系统信息和运行日志
- **错误追踪**：详细的错误报告和日志记录
- **开发者工具**：一键打开 DevTools 进行调试

### 💾 数据存档
- **自动备份**：支持定期自动备份数据
- **手动备份**：一键创建数据备份文件
- **数据导入导出**：支持 JSON 格式的数据迁移
- **数据清理**：安全的数据清空功能

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3**：采用 Composition API 的现代化前端框架
- **Electron**：跨平台桌面应用开发框架
- **Vite**：快速的构建工具和开发服务器

### 架构设计
- **组件化开发**：模块化的 Vue 组件设计
- **Composables**：可复用的逻辑组合函数
- **响应式状态管理**：基于 Vue 3 的响应式数据管理
- **IPC 通信**：主进程与渲染进程间的安全通信

### 项目结构
```
src/
├── main/              # Electron 主进程
├── preload/           # 预加载脚本
└── renderer/          # 渲染进程 (Vue 应用)
    ├── src/
    │   ├── components/    # Vue 组件
    │   ├── composables/   # 组合式函数
    │   ├── utils/         # 工具函数
    │   └── assets/        # 静态资源
    └── index.html
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# 代码格式化
npm run format
```

## 📦 构建与打包

### 构建应用

```bash
npm run build
```

### 打包为可执行文件

```bash
# Windows 版本
npm run build:win

# macOS 版本  
npm run build:mac

# Linux 版本
npm run build:linux

# 仅构建不打包
npm run build:unpack
```

## 🔧 开发工具配置

### 推荐的 IDE 设置
- [VSCode](https://code.visualstudio.com/) - 主要开发环境
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 代码质量检查
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 语言支持

### 调试配置
应用内置了完整的调试工具：
- 系统信息查看
- 运行日志记录
- 错误追踪
- 性能监控

## 📚 使用指南

### 基本使用
1. 启动应用后，它会自动开始监控屏幕使用时间
2. 主界面显示当日总使用时间和各应用详细统计
3. 可通过日期导航查看历史数据
4. 系统托盘图标可快速访问主要功能

### 设置配置
1. 点击设置按钮打开设置面板
2. 在"基本设置"中配置主题、通知等选项
3. 在"调试工具"中查看系统信息和日志
4. 在"数据存档"中管理数据备份

### 数据管理
- 数据自动保存到本地文件
- 支持设置数据保留天数
- 可导出数据用于备份或迁移
- 提供安全的数据清理功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Electron Vite 文档](https://electron-vite.org/)
