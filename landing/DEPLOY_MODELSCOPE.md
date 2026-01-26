# 魔搭创空间生产部署方案

- 部署类型：Docker
- 服务端口：7860
- 资源规格：platform/2v-cpu-16g-mem（可根据需要升级 xGPU）
- 运行时：Node + Nginx（多阶段构建，Nginx 静态托管 Vite 构建产物）

## 仓库准备
- 已存在文件：
  - [Dockerfile](file:///e:/Code/AI/AI/Start/guanw/Dockerfile)
  - [deploy/nginx.conf](file:///e:/Code/AI/AI/Start/guanw/deploy/nginx.conf)
  - [vite.config.ts](file:///e:/Code/AI/AI/Start/guanw/vite.config.ts)
- 新增文件：
  - [ms_deploy.json](file:///e:/Code/AI/AI/Start/guanw/ms_deploy.json)

## ms_deploy.json
- 位置：仓库根目录
- 内容要点：
  - sdk_type: docker
  - resource_configuration: platform/2v-cpu-16g-mem
  - port: 7860
- 该配置遵循官方 schema：https://modelscope.cn/api/v1/studios/deploy_schema.json

## 构建与运行
- Docker 构建流程：
  - 使用 node:20-alpine 进行前端依赖安装与 Vite 构建（npm ci → npm run build）
  - 使用 nginx:1.25-alpine 作为运行镜像，拷贝构建产物至 /usr/share/nginx/html
  - 应用 Nginx 配置文件，监听 7860 并启用前端路由 fallback
- 运行时暴露端口：7860（符合魔搭创空间 docker 部署要求）

## 在魔搭创空间创建与部署
- 打开“创空间列表 → 创建创空间 → 编程式创空间”，切换到“快速部署并创建”
- 选择仓库或上传压缩包，系统会自动读取 ms_deploy.json
- 部署参数：
  - 部署类型：Docker（由 ms_deploy.json 指定）
  - 资源规格：platform/2v-cpu-16g-mem（默认可用、零成本）
  - 端口：7860（固定）
- 提交后平台会：
  - 拉取仓库
  - 执行 Docker 构建
  - 启动容器并开放 7860 访问地址

## 环境变量
- 当前项目未使用环境变量
- 若后续需要，请在 ms_deploy.json 的 environment_variables 中添加 name/value 对

## 验证与排障
- 验证：
  - 访问创空间生成的预览地址
  - 首页应正常加载，路由与静态资源可用
- 常见问题：
  - 构建失败：检查网络依赖安装、Node 版本兼容（已使用 node:20-alpine）
  - 端口不通：确认容器监听 7860，且配置与 schema 保持一致
  - 前端路由 404：已启用 Nginx try_files 到 /index.html

## 升级与变更
- 修改代码后重新部署即可
- 如需更高资源或 GPU：调整 ms_deploy.json 的 resource_configuration 到 xgpu 系列（需资格）
