@echo off
echo 正在启动地理信息大数据可视化平台服务器...

cd %~dp0\server

echo 检查环境变量...
if not exist .env (
  echo 创建默认.env文件
  echo # 数据库配置 > .env
  echo DB_HOST=localhost >> .env
  echo DB_USER=nct >> .env
  echo DB_PASSWORD=Wzt040824! >> .env
  echo DB_NAME=geo_data >> .env
  echo DB_PORT=3306 >> .env
  echo # 服务器配置 >> .env
  echo PORT=5000 >> .env
)

echo 启动服务器...
node index.js

pause