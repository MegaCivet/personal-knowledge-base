# --- 第一阶段：构建 (Build Stage) ---
FROM node:20-alpine as build

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
# 使用淘宝镜像源加速（可选）
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# --- 第二阶段：服务 (Serve Stage) ---
FROM nginx:alpine

# 复制自定义的 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物 (dist 目录) 到 Nginx 的 html 目录
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]