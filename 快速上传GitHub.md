# 快速上传到GitHub - 5步完成

## 第一步：在GitHub创建仓库

1. 访问 https://github.com 并登录
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - Repository name: `product-management-demo`
   - 选择 **Public** (开源)
   - **不要**勾选任何初始化选项
4. 点击 **Create repository**
5. **复制仓库地址**（类似：`https://github.com/你的用户名/product-management-demo.git`）

## 第二步：打开命令行

在Windows上：
- 按 `Win + R`，输入 `cmd` 或 `powershell`，回车
- 或者：在项目文件夹中，按住 `Shift + 右键`，选择"在此处打开PowerShell窗口"

## 第三步：执行Git命令

在命令行中，**依次执行**以下命令（将 `你的用户名` 替换为您的GitHub用户名）：

```bash
# 1. 进入项目目录（如果不在项目目录的话）
cd D:\Code\product_management_demo

# 2. 初始化Git仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建第一个提交
git commit -m "初始提交：产品参数管理系统"

# 5. 添加远程仓库（替换下面的地址为您的仓库地址）
git remote add origin https://github.com/你的用户名/product-management-demo.git

# 6. 设置主分支
git branch -M main

# 7. 推送到GitHub（首次需要输入GitHub用户名和密码/token）
git push -u origin main
```

## 第四步：输入GitHub凭证

执行 `git push` 时会提示输入：
- **Username**: 输入您的GitHub用户名
- **Password**: 输入GitHub Personal Access Token（不是登录密码！）

### 如何获取Personal Access Token：

1. GitHub → 右上角头像 → **Settings**
2. 左侧菜单最下方 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. 点击 **Generate new token (classic)**
5. Note填写：`产品管理系统`
6. 勾选权限：**repo** (全部)
7. 点击 **Generate token**
8. **复制token**（只显示一次！）

## 第五步：验证上传

1. 刷新GitHub仓库页面
2. 应该能看到所有文件
3. 完成！

---

## 从GitHub下载项目（在其他电脑）

在其他电脑或位置下载项目：

```bash
git clone https://github.com/你的用户名/product-management-demo.git
cd product-management-demo
npm install
npm run dev
```

---

## 后续更新代码的步骤

修改代码后，上传更新的步骤：

```bash
# 1. 进入项目目录
cd D:\Code\product_management_demo

# 2. 查看修改的文件
git status

# 3. 添加所有修改
git add .

# 4. 提交（描述您的修改）
git commit -m "更新：添加新功能"

# 5. 推送到GitHub
git push
```

---

## 常见问题

### Q: 提示需要配置用户信息
**解决**：
```bash
git config --global user.name "您的GitHub用户名"
git config --global user.email "您的GitHub邮箱"
```

### Q: 推送失败，提示认证错误
**解决**：使用Personal Access Token代替密码

### Q: 想重新开始
**解决**：删除 `.git` 文件夹（如果存在），然后重新执行步骤

---

## 推荐工具（可选）

如果命令行不习惯，可以使用：
- **GitHub Desktop**: https://desktop.github.com/ （图形界面，更简单）
- **VS Code**: 内置Git支持，可以可视化操作
