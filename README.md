<div align="center">
	<h1>慢跑后台管理系统</h1>
</div>

## ✨ 简介

使用`React`,`Typescript`,`Vite`,`Antd`等主流技术开发的开箱即用的中后台前端项目，`Vite`实现自动生成路由，支持`KeepAlive`功能，`zustand`状态管理，支持虚拟滚动表格，`UnoCss`开发样式。

## 💻 安装使用

- 获取项目代码

```bash
git clone http://192.168.10.6:9980/manpao/qianduan/manpao-admin.git
```

- 选择目录

```bash
cd manpao-admin
```

- 安装pnpm

```bash
npm i -g pnpm
```

- 安装依赖
```bash
pnpm install -w
```

- 运行

```bash
pnpm dev
```

- 打包

```bash
pnpm build
```

## 📁 项目结构

```tree
react-admin
├── build                     # 构建相关配置
│   ├── utils                 # 构建工具函数
│   └── vite                  # vite 配置
├── packages                  # monorepo子包
│   ├── message               # 消息模块
│   ├── request               # 请求模块
│   ├── stylelintConfig       # stylelint配置
│   ├── utils                 # 工具函数
|   └── status-codes          # 逻辑状态码管理
├── public                    # 静态资源
├── src                       # 源代码
│   ├── assets                # 静态资源
│   │   ├── css               # 样式文件
│   │   └── fonts             # 字体文件
│   ├── components            # 公共组件
│   │   ├── Form              # 表单组件
│   │   └── Table             # 表格组件
│   ├── layouts               # 布局组件
│   │   └── components        # 布局子组件
│   ├── locales               # 国际化配置
│   ├── menus                 # 菜单配置
│   ├── pages                 # 页面
│   │   ├── content           # 内容管理
│   │   └── system            # 系统管理
│   ├── router                # 路由配置
│   ├── servers               # API 接口
│   ├── stores                # 状态管理
│   └── utils                 # 工具函数
├── types                     # TS类型定义
├── .eslintrc.cjs             # ESLint 配置
├── .gitignore                # Git 忽略文件
├── index.html                # HTML 模板
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript 配置
└── vite.config.ts            # Vite 配置
```

## 🧩 图标(iconify)

- 参考 [iconify官方地址](https://icon-sets.iconify.design/)
- VS Code安装Iconify IntelliSense - 图标内联显示和自动补全

## 🎗️ Git 提交示例
### Git提交不规范会导致无法提交，`feat`关键字可以按照下面`Git 贡献提交规范`来替换。
```
git add .
git commit -m "feat: 新增功能"
git push
```
### 按照以上规范依旧无法提交代码，请在终端执行`npx husky install`之后重新提交。

## 🎯 Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

## 🐵 关于封装
  1. 功能扩展，在原有的api上拓展。
  2. 功能整合，合并两个或两个以上组件的api。
  3. 样式统一，避免后期样式变动，导致牵一发而动全身。
  4. 公共组件二次封装或常用组件使用**Base**开头，便于区分。

## 📕 Q&A常见问题
#### 1. 页面权限如何配置？
1. 通过登录接(/user/login)或重新授权接口(/user/refresh-permissions)获取permissions权限数据。
2. 通过菜单接口(/menu/list)获取data中的rule权限数据，这个rule数据影响菜单显示，如果没返回rule则一直都显示。
3. 页面内权限参考src/pages/system/menu.index.tsx文件内的pagePermission数据，pagePermission.page是显示页面的权限，根据第一点返回的permissions进行匹配。

#### 2. 路由如何配置？
路由根据文件夹路径自动生成，路径包含以下文件名或文件夹名称则不生成：

* login
* forget
* components
* utils
* lib
* hooks
* model.tsx
* 404.tsx

可自行在 src/router/utils/config.ts 修改路由生成规则。

#### 3. 菜单如何配置？
提供了两种方式配置菜单：
1. 动态菜单，通过菜单接口(/menu/list)获取菜单数据。
2. 静态菜单，需要静态菜单将/src/hooks/useCommonStore.ts中的useCommonStore中的menuList改为defaultMenus。
```js
// src/hooks/useCommonStore.ts
import { defaultMenus } from '@/menus';

// const menuList = useMenuStore(state => state.menuList);
// 菜单数据
const menuList = defaultMenus;
```

#### 4. @manpao/xxx依赖在哪查看？
通过根目录`packages`文件中查看对于xxx文件的源码进行修改。

#### 5. 安装新依赖时报错？
使用了monorepo项目安装新依赖时需要在后面添加`-w`或`--workspace`，否则会报错，比如：`pnpm i mobx -w`。
