@echo off
echo 正在初始化地理信息大数据可视化平台数据库...

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

echo 开始初始化数据库...
echo 注意：此过程将生成百万级数据，可能需要较长时间，请耐心等待。
node init-db.js

echo 数据库初始化完成！
pause