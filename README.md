# 慢病管理系统 - 前端（医生管理端 / PC Web）

基于 [RuoYi-Vue3](https://github.com/yangzongzhuan/RuoYi-Vue3) v3.9.2（Vue3 + Element Plus + Vite）开发。
配套后端仓库：`chronic-disease-management-system`（Spring Boot 4.1.0 + JDK 17）。

## 环境要求

- Node.js 20 LTS 及以上（本项目在 v24 下验证可用）
- npm 10 及以上

## 快速开始

```bash
# 1. 安装依赖（使用国内镜像加速）
npm install --registry=https://registry.npmmirror.com

# 2. 启动开发服务器
npm run dev
```

启动后访问：http://localhost:1024

登录账号：`admin` / `admin123`

> Windows 下如果 PowerShell 提示"禁止运行脚本"，请改用 cmd 执行，或运行：
> `cmd /c "npm run dev"`

## 后端联调

前端开发服务器已配置代理，请求 `/dev-api/**` 会自动转发到后端。

代理配置位置：`vite.config.js`

```js
const baseUrl = 'http://localhost:8080' // 后端接口地址
```

如需连接其他机器上的后端，把上面的地址改成对应 IP（如 `http://192.168.1.8:8080`）。

启动后端前请确保：

- MySQL 已启动，且已导入后端仓库 `sql/` 下的脚本
- Redis 已启动

## 构建

```bash
npm run build:prod    # 生产环境
npm run build:stage   # 预发布环境
```

产物输出到 `dist/` 目录。

## 目录说明

```
src/
  api/          接口调用，按业务模块划分
  views/        页面，按业务模块划分
  components/   公共组件
  layout/       整体布局（侧边栏、导航栏、标签页）
  router/       路由（业务菜单由后端动态下发，一般无需改动）
  store/        Pinia 状态管理
  utils/        request 封装、权限校验、字典等工具
  directive/    自定义指令（如 v-hasPermi 按钮权限）
vite/           Vite 插件配置
.env.development / .env.production   环境变量
```

## 开发约定

- 接口统一返回结构：`AjaxResult`（`{ code, msg, data }`）与 `TableDataInfo`（`{ code, msg, rows, total }`）
- `code === 200` 表示成功，异常提示由 `src/utils/request.js` 统一处理
- 按钮级权限使用 `v-hasPermi="['模块:功能:操作']"`
- 业务枚举（病种、预警级别等）统一使用后端字典，通过 `useDict` 获取，不要在前端写死
- 新增页面需与后端菜单配置的 `component` 路径保持一致

## 分支规范

| 分支 | 用途 |
|---|---|
| `main` | 主分支，保持可运行 |
| `zkb` | 后端 / 组长开发分支 |
| `frontend-*` | 前端成员各自的分支 |

开发流程：从 `main` 拉出个人分支 → 开发提交 → 发起 Pull Request → 评审合并。

## 说明

- 本项目基于 RuoYi-Vue3 二次开发，框架原始说明见 `RuoYi-Vue3-官方说明.md`
- 患者端与家属端小程序为独立项目，不在本仓库内