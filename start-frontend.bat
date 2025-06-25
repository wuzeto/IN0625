@echo off
echo 正在启动地理信息大数据可视化平台前端...

cd %~dp0

echo 检查是否安装了npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误：未找到npm，请先安装Node.js
    pause
    exit /b
)

echo 检查node_modules目录...
if not exist node_modules\ (
    echo 正在安装依赖...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo 错误：依赖安装失败
        pause
        exit /b
    )
)

echo 启动开发服务器...
npm run dev
if %ERRORLEVEL% neq 0 (
    echo 错误：启动失败，请检查package.json配置和控制台错误信息
    pause
    exit /b
)

pause