# GitHub使用指南

本指南将帮助您将项目上传到GitHub并实现远程管理。

## 前置准备

1. **确保已安装Git**
   - Windows: 通常Git会随系统安装，或从 https://git-scm.com/ 下载
   - 检查安装：在命令行输入 `git --version`

2. **拥有GitHub账号**
   - 访问 https://github.com 注册或登录

## 第一步：在GitHub上创建仓库

1. 登录GitHub账号
2. 点击右上角的 **+** 号，选择 **New repository**
3. 填写仓库信息：
   - **Repository name**: `product-management-demo` (或您喜欢的名字)
   - **Description**: 产品参数管理系统 (可选)
   - **Public** 或 **Private**: 选择Public表示开源
   - **不要**勾选 "Initialize this repository with a README" (我们已有代码)
4. 点击 **Create repository**

创建成功后，GitHub会显示仓库地址，类似：
```
https://github.com/你的用户名/product-management-demo.git
```

## 第二步：在本地初始化Git仓库

在项目目录下执行以下命令：

```bash
# 1. 进入项目目录
cd product_management_demo

# 2. 初始化Git仓库
git init

# 3. 添加所有文件到暂存区
git add .

# 4. 提交文件（创建第一个提交）
git commit -m "初始提交：产品参数管理系统"

# 5. 添加远程仓库（替换为您的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/product-management-demo.git

# 6. 将代码推送到GitHub（首次推送）
git branch -M main
git push -u origin main
```

## 第三步：配置Git用户信息（如果还没有配置）

如果这是您第一次使用Git，需要先配置用户信息：

```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"
```

## 常见操作说明

### 查看Git状态
```bash
git status
```

### 添加文件到暂存区
```bash
git add 文件名        # 添加单个文件
git add .            # 添加所有文件
```

### 提交更改
```bash
git commit -m "提交说明"
```

### 推送到GitHub
```bash
git push
```

### 从GitHub拉取最新代码
```bash
git pull
```

### 查看提交历史
```bash
git log
```

## 从GitHub下载项目到本地（在其他地方）

如果您想在其他电脑上获取项目：

```bash
# 1. 克隆仓库到本地
git clone https://github.com/你的用户名/product-management-demo.git

# 2. 进入项目目录
cd product-management-demo

# 3. 安装依赖
npm install

# 4. 启动项目
npm run dev
```

## 后续开发工作流程

当您修改代码后，更新到GitHub的步骤：

```bash
# 1. 查看修改的文件
git status

# 2. 添加修改的文件
git add .

# 3. 提交更改
git commit -m "描述您做的修改"

# 4. 推送到GitHub
git push
```

## 注意事项

1. **不要提交敏感信息**
   - `.gitignore` 文件已经配置好，会自动忽略 `node_modules` 等文件
   - 不要提交包含密码、API密钥的文件

2. **提交信息要有意义**
   - 使用清晰的中文或英文描述您的更改
   - 例如：`git commit -m "添加数据导入功能"`

3. **定期提交和推送**
   - 完成一个功能或修复一个bug后就提交
   - 不要等到所有工作完成才提交

4. **推送前先拉取**
   - 如果多人协作，推送前先执行 `git pull` 获取最新代码

## 遇到问题？

### 问题1：推送被拒绝
**解决方案**：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 问题2：需要输入用户名密码
**解决方案**：使用GitHub Personal Access Token
1. GitHub -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
2. 生成新token，复制保存
3. 推送时密码处输入token

### 问题3：想撤销最近的提交
```bash
git reset --soft HEAD~1  # 撤销提交但保留更改
```

## 推荐的Git图形界面工具（可选）

如果您不习惯命令行，可以使用图形界面工具：
- **GitHub Desktop**: https://desktop.github.com/
- **SourceTree**: https://www.sourcetreeapp.com/
- **VS Code内置Git**: VS Code已经内置Git支持

## 开源协议说明

如果您选择开源（Public），建议添加开源协议。常见选择：
- **MIT License**: 最宽松的开源协议
- **Apache 2.0**: 适合大型项目
- **GPL v3**: 要求衍生作品也开源

可以在项目根目录创建 `LICENSE` 文件，或使用GitHub创建仓库时的选项。
