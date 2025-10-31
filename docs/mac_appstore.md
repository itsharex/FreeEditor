# FreeEditor Mac App Store 发布指南

本文档介绍如何将 FreeEditor 打包成 Mac 应用并在 App Store 上分发。

## 目录

- [前置准备](#前置准备)
- [配置 electron-builder](#配置-electron-builder)
- [代码签名和公证](#代码签名和公证)
- [本地打包测试](#本地打包测试)
- [提交到 App Store](#提交到-app-store)
- [常见问题](#常见问题)

## 前置准备

### 1. Apple 开发者账号

- 注册 [Apple Developer Program](https://developer.apple.com/programs/)
- 费用：$99/年
- 等待审核通过（通常需要 1-2 个工作日）

### 2. 所需证书

在 Mac 上，打开 **Xcode** > **Preferences** > **Accounts**，添加你的 Apple ID 后，下载以下证书：

#### App Store 分发需要的证书：

1. **Mac App Distribution** - 用于 App Store 分发的签名证书
2. **Mac Installer Distribution** - 用于签名安装包

#### 本地测试需要的证书（可选）：

1. **Mac Development** - 用于开发测试
2. **Apple Development** - 用于开发测试

### 3. 创建 App ID

1. 访问 [Apple Developer - Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. 点击 **+** 创建新的 App ID
3. 选择 **App IDs** > **macOS**
4. 填写信息：
   - **Description**: FreeEditor
   - **Bundle ID**: `com.freeeditor.app`（必须与 package.json 中的 appId 一致）
5. 根据需要启用 Capabilities（如 App Sandbox）
6. 点击 **Continue** 并 **Register**

### 4. 创建 Provisioning Profile

1. 访问 [Apple Developer - Profiles](https://developer.apple.com/account/resources/profiles/list)
2. 点击 **+** 创建新的 Profile
3. 选择 **Mac App Store**
4. 选择之前创建的 App ID
5. 选择对应的证书
6. 下载并双击安装 Provisioning Profile

### 5. 开发环境准备

确保安装以下工具：

```bash
# 安装 Xcode（从 App Store 安装）
# 安装 Xcode Command Line Tools
xcode-select --install

# 验证安装
xcodebuild -version
```

## 配置 electron-builder

### 1. 更新 package.json

修改 `package.json`，在 `build` 字段中添加 Mac 和 App Store 配置：

```json
{
  "build": {
    "appId": "com.freeeditor.app",
    "productName": "FreeEditor",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "public/logo.ico"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "public/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "target": [
        {
          "target": "default",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "mas": {
      "category": "public.app-category.productivity",
      "icon": "public/icon.icns",
      "hardenedRuntime": false,
      "entitlements": "build/entitlements.mas.plist",
      "entitlementsInherit": "build/entitlements.mas.inherit.plist",
      "provisioningProfile": "build/embedded.provisionprofile",
      "type": "distribution"
    },
    "dmg": {
      "contents": [
        {
          "x": 130,
          "y": 220
        },
        {
          "x": 410,
          "y": 220,
          "type": "link",
          "path": "/Applications"
        }
      ]
    },
    "win": {
      "icon": "public/logo.ico",
      "target": ["nsis"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 2. 准备应用图标

需要创建 `.icns` 格式的 Mac 图标文件：

```bash
# 创建图标目录
mkdir icon.iconset

# 准备不同尺寸的 PNG 图片（从你的原始图标生成）
sips -z 16 16     original-icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     original-icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     original-icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     original-icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   original-icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   original-icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   original-icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   original-icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   original-icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 original-icon.png --out icon.iconset/icon_512x512@2x.png

# 生成 .icns 文件
iconutil -c icns icon.iconset -o public/icon.icns

# 清理
rm -rf icon.iconset
```

### 3. 创建 entitlements 文件

#### a. 创建 `build/entitlements.mac.plist`（用于 DMG 安装包）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
  </dict>
</plist>
```

#### b. 创建 `build/entitlements.mas.plist`（用于 App Store）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
  </dict>
</plist>
```

#### c. 创建 `build/entitlements.mas.inherit.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.inherit</key>
    <true/>
  </dict>
</plist>
```

### 4. 添加构建脚本

在 `package.json` 中添加新的构建命令：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"npm run dev\" \"node electron/wait-and-start.js\"",
    "electron:build": "cross-env ELECTRON=true vite build && electron-builder",
    "electron:build:mac": "cross-env ELECTRON=true vite build && electron-builder --mac",
    "electron:build:mas": "cross-env ELECTRON=true vite build && electron-builder --mac mas"
  }
}
```

## 代码签名和公证

### 1. 查看可用证书

```bash
# 查看所有可用的签名证书
security find-identity -v -p codesigning
```

你应该看到类似以下输出：

```
1) XXXXXXXXXX "Mac Developer: Your Name (TEAMID)"
2) XXXXXXXXXX "3rd Party Mac Developer Application: Your Name (TEAMID)"
3) XXXXXXXXXX "3rd Party Mac Developer Installer: Your Name (TEAMID)"
```

### 2. 配置环境变量（推荐）

创建 `.env.local` 文件（不要提交到 Git）：

```bash
# 用于 DMG 分发
CSC_NAME="Developer ID Application: Your Name (TEAMID)"

# 用于 App Store 分发
MAS_SIGN="3rd Party Mac Developer Application: Your Name (TEAMID)"
MAS_INSTALL_SIGN="3rd Party Mac Developer Installer: Your Name (TEAMID)"

# Apple ID（用于公证）
APPLE_ID="your-apple-id@example.com"
APPLE_ID_PASSWORD="app-specific-password"
APPLE_TEAM_ID="TEAMID"
```

### 3. 生成 App 专用密码

如果需要���证（Notarization），需要生成 App 专用密码：

1. 访问 [appleid.apple.com](https://appleid.apple.com/)
2. 登录你的 Apple ID
3. 在 **安全** 部分，点击 **生成密码**
4. 输入标签（如 "FreeEditor Notarization"）
5. 保存生成的密码，用于上面的 `APPLE_ID_PASSWORD`

## 本地打包测试

### 1. 构建标准 Mac 应用（DMG）

```bash
# 构建 DMG 安装包（支持在 Mac 上直接安装）
npm run electron:build:mac
```

构建完成后，文件位于 `release/` 目录：
- `FreeEditor-1.0.0.dmg` - DMG 安装包
- `FreeEditor-1.0.0-mac.zip` - ZIP 压缩包

### 2. 测试应用

```bash
# 打开 DMG 文件
open release/FreeEditor-1.0.0.dmg

# 将应用拖到 Applications 文件夹
# 然后从 Applications 文件夹启动应用
```

### 3. 构建 App Store 版本

```bash
# 构建 App Store 版本
npm run electron:build:mas
```

构建完成后，文件位于 `release/mas/`：
- `FreeEditor-1.0.0.pkg` - 用于提交到 App Store 的安装包

## 提交到 App Store

### 1. 在 App Store Connect 创建应用

1. 访问 [App Store Connect](https://appstoreconnect.apple.com/)
2. 点击 **我的 App** > **+** > **新建 App**
3. 填写应用信息：
   - **平台**: macOS
   - **名称**: FreeEditor
   - **主要语言**: 简体中文
   - **套装 ID**: com.freeeditor.app
   - **SKU**: 自定义唯一标识（如 `freeeditor-macos`）
   - **用户访问权限**: 完全访问权限

### 2. 填写应用元数据

在 App Store Connect 中，需要填写以下信息：

#### 基本信息
- **App 名称**: FreeEditor
- **副标题**: 简洁的双栏 Markdown 编辑器
- **类别**:
  - 主要：效率
  - 次要：开发者工具

#### 描述
```
一款简洁的双栏 Markdown 编辑器，支持实时预览和微信公众号样式导出。

主要特性：
• 实时预览 - 边写边看，所见即所得
• 丰富样式库 - 内置多种精美的标题、代码、引用块样式
• 移动端预览 - 支持手机视图预览，适配微信公众号
• 一键复制 - 直接复制富文本，可粘贴到微信公众号编辑器
• 主题切换 - 支持深色/浅色主题
• 文件夹管理 - 支持文件夹分类管理文档
• 图片上传 - 支持拖拽/粘贴上传图片到阿里云 OSS
• 快捷键支持 - 丰富的编辑快捷键，提升编辑效率
• 本地存储 - 自动保存，数据存储在本地
• 备份恢复 - 支持数据导出和导入
```

#### 关键词
```
markdown, 编辑器, 公众号, 写作, 文本编辑, 预览, 导出
```

#### 支持 URL
```
https://github.com/zstar1003/FreeEditor
```

#### 营销 URL（可选）
```
https://xdxsb.top/FreeEditor
```

#### 隐私政策 URL
需要准备一个隐私政策页面，内容包括：
- 应用不收集用户个人信息
- 本地存储说明
- 阿里云 OSS 配置为用户自行配置，不存储在服务器

### 3. 准备截图

需要准备以下尺寸的截图：

- **13.3 英寸 Mac**: 2560 x 1600 像素
- **16 英寸 Mac**: 3456 x 2234 像素

至少需要 1 张，最多 10 张。

使用以下方法截图：
```bash
# 按 Command + Shift + 3 截取整个屏幕
# 按 Command + Shift + 4 截取选定区域
# 按 Command + Shift + 5 打开截图工具
```

### 4. 设置定价

在 **定价和销售范围** 部分：
- 选择 **免费**（如果应用免费）
- 或设置价格（如 $0.99, $2.99 等）
- 选择销售区域

### 5. 上传构建版本

使用 **Transporter** 应用上传 `.pkg` 文件：

#### 方法一：使用 Transporter（推荐）

1. 从 Mac App Store 下载 **Transporter**
2. 打开 Transporter，使用 Apple ID 登录
3. 点击 **+** 或拖拽 `FreeEditor-1.0.0.pkg` 到窗口
4. 点击 **交付**
5. 等待上传和处理完成（通常需要 10-30 分钟）

#### 方法二：使用命令行工具

```bash
# 安装 xcrun（通常已随 Xcode 安装）
# 上传 pkg 文件
xcrun altool --upload-app \
  --type macos \
  --file "release/mas/FreeEditor-1.0.0.pkg" \
  --username "your-apple-id@example.com" \
  --password "app-specific-password"
```

### 6. 选择构建版本

1. 上传完成后，返回 **App Store Connect**
2. 进入你的应用 > **构建版本**
3. 等待构建版本处理完成（状态变为"准备提交"）
4. 在 **App Store** 标签下，点击 **构建版本** 旁的 **+**
5. 选择刚上传的构建版本

### 7. 完成 App 审核信息

填写以下内容：

#### App 审核信息
- **联系信息**: 提供姓名、电话、邮箱
- **备注**: 可选，提供审核说明

#### 版本发布
- 选择 **手动发布此版本** 或 **自动发布此版本**

### 8. 提交审核

1. 检查所有信息是否完整
2. 点击右上角 **提交以供审核**
3. 回答出口合规性问题：
   - "您的 App 是否使用加密？" - 如果只使用 HTTPS，选择"否"
4. 点击 **提交**

### 9. 等待审核

审核时间通常为 1-3 个工作日。审核状态：

- **等待审核**: 已提交，等待审核团队处理
- **正在审核**: 审核团队正在审核
- **被拒绝**: 需要根据反馈修改后重新提交
- **准备销售**: 审核通过，应用已上架

## 常见问题

### Q1: 构建时提示找不到证书

**问题**: `Error: Cannot find certificate`

**解决方案**:
1. 确保已在 Keychain Access 中安装证书
2. 运行 `security find-identity -v -p codesigning` 查看可用证书
3. 确保 `CSC_NAME` 或相关环境变量正确

### Q2: 代码签名失败

**问题**: `Code signing failed`

**解决方案**:
1. 检查 entitlements 文件是否正确
2. 确保 App ID 和 Bundle ID 一致
3. 验证 Provisioning Profile 是否有效

### Q3: 公证失败

**问题**: `Notarization failed`

**解决方案**:
1. 确保使用了 hardened runtime
2. 检查 entitlements 是否包含必要的权限
3. 确认 App 专用密码正确

### Q4: 上传到 App Store 失败

**问题**: `Upload failed with error`

**解决方案**:
1. 确保使用正确的 Provisioning Profile
2. 检查 Bundle ID 是否与 App Store Connect 中一致
3. 确认使用了 `mas` target 构建

### Q5: 审核被拒绝

**常见原因**:
1. **隐私政策缺失**: 提供隐私政策 URL
2. **功能不完整**: 确保所有功能正常工作
3. **界面问题**: 遵循 macOS Human Interface Guidelines
4. **权限说明不清**: 在 Info.plist 中添加权限说明

**解决方案**: 根据审核反馈修改，然后重新提交

### Q6: 如何更新版本

1. 更新 `package.json` 中的 `version` 字段
2. 重新构建应用
3. 在 App Store Connect 中创建新版本
4. 上传新的构建版本
5. 提交审核

## 自动化发布

可以使用 CI/CD 工具（如 GitHub Actions）自动化构建和发布流程：

### GitHub Actions 示例

创建 `.github/workflows/release.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build for Mac
        run: npm run electron:build:mac
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: mac-build
          path: release/*.dmg
```

## 参考资源

- [Electron 官方文档 - Mac App Store](https://www.electronjs.org/docs/latest/tutorial/mac-app-store-submission-guide)
- [electron-builder 文档](https://www.electron.build/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Mac App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## 支持

如有问题，请访问：
- GitHub Issues: https://github.com/zstar1003/FreeEditor/issues
- 项目主页: https://xdxsb.top/FreeEditor

---

**祝你发布顺利！** 🎉
