@echo off
chcp 65001 >nul
echo ========================================
echo 初始化Git仓库并准备上传到GitHub
echo ========================================
echo.

echo 请先确认：
echo 1. 已在GitHub上创建了仓库
echo 2. 已复制了仓库地址（类似：https://github.com/用户名/product-management-demo.git）
echo.
pause

echo.
echo 请输入您的GitHub用户名：
set /p GITHUB_USERNAME=

echo.
echo 请输入仓库名称（默认：product-management-demo）：
set /p REPO_NAME=product-management-demo
if "%REPO_NAME%"=="" set REPO_NAME=product-management-demo

echo.
echo 正在初始化Git仓库...
git init
if errorlevel 1 (
    echo 错误：Git未安装或未配置在PATH中
    pause
    exit /b 1
)

echo.
echo 正在添加文件...
git add .

echo.
echo 正在创建首次提交...
git commit -m "初始提交：产品参数管理系统"

echo.
echo 正在添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo 设置主分支...
git branch -M main

echo.
echo ========================================
echo 初始化完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 执行命令：git push -u origin main
echo 2. 输入GitHub用户名
echo 3. 输入Personal Access Token（不是密码！）
echo.
echo 提示：如果还没有Personal Access Token，请查看"快速上传GitHub.md"文件
echo.
pause
