# macOS 打包、签名和公证指南

本文档介绍如何为 FreeEditor 创建 macOS 安装包，并进行代码签名和公证。

## 前置要求

1. **Apple Developer 账号**
   - 需要付费的 Apple Developer Program 账号（$99/年）
   - 访问 https://developer.apple.com 注册

2. **开发者证书**
   - 在 Keychain Access 中安装 "Developer ID Application" 证书
   - 在 Apple Developer 网站的 Certificates 页面创建

3. **App 专用密码**
   - 用于公证的应用专用密码
   - 在 https://appleid.apple.com 创建

## 环境变量配置

构建和公证需要以下环境变量：

```bash
# Apple ID (用于公证)
export APPLE_ID="your-apple-id@example.com"

# App 专用密码 (在 appleid.apple.com 生成)
# 注意: electron-builder 使用 APPLE_APP_SPECIFIC_PASSWORD
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"

# Team ID (在 Apple Developer 账号中查找)
export APPLE_TEAM_ID="XXXXXXXXXX"

# 可选：指定签名证书
# export CSC_NAME="Developer ID Application: Your Name (TEAMID)"
```

### 获取 Team ID

1. 访问 https://developer.apple.com/account
2. 登录后在右上角可以看到 Team ID
3. 或者在终端运行: `security find-identity -v -p codesigning`

### 创建 App 专用密码

1. 访问 https://appleid.apple.com
2. 登录你的 Apple ID
3. 在"登录和安全性"部分，找到"App 专用密码"
4. 点击"生成密码"，给它命名（如 "FreeEditor Notarization"）
5. 保存生成的密码（格式：xxxx-xxxx-xxxx-xxxx）

## 构建步骤

### 1. 设置环境变量

创建 `.env.local` 文件（不要提交到 git）：

```bash
APPLE_ID=your-apple-id@example.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
```

然后加载环境变量：

```bash
source .env.local
```

### 2. 构建 macOS 应用

```bash
# 构建 Intel (x64) 版本
npm run electron:build -- --mac --x64

# 构建 Apple Silicon (arm64) 版本
npm run electron:build -- --mac --arm64

# 构建通用版本 (同时支持 Intel 和 Apple Silicon)
npm run electron:build -- --mac --universal
```

### 3. 构建输出

构建完成后，在 `release` 目录下会生成：

- `FreeEditor-1.0.0.dmg` - DMG 安装包
- `FreeEditor-1.0.0-mac.zip` - ZIP 压缩包
- `FreeEditor-1.0.0-arm64.dmg` - ARM64 版本（如果指定）
- `FreeEditor-1.0.0-x64.dmg` - x64 版本（如果指定）

## 签名和公证流程

electron-builder 会自动处理：

1. **代码签名**
   - 使用 "Developer ID Application" 证书签名
   - 启用 Hardened Runtime
   - 应用 entitlements

2. **公证（Notarization）**
   - 自动上传到 Apple 公证服务
   - 等待公证完成
   - 将公证票据附加到应用

3. **DMG 签名**
   - 对最终的 DMG 文件进行签名

## 验证

### 检查签名

```bash
# 检查应用签名
codesign -dv --verbose=4 release/mac/FreeEditor.app

# 验证签名
codesign --verify --deep --strict --verbose=2 release/mac/FreeEditor.app

# 检查 Gatekeeper
spctl -a -t exec -vv release/mac/FreeEditor.app
```

### 检查公证状态

```bash
# 检查公证票据
stapler validate release/FreeEditor-1.0.0.dmg
```

## 常见问题

### 1. 找不到签名证书

**错误**: `Error: Cannot find signing certificate`

**解决方案**:
- 确保已安装 "Developer ID Application" 证书
- 运行 `security find-identity -v -p codesigning` 查看可用证书
- 设置 `CSC_NAME` 环境变量指定证书名称

### 2. 公证失败

**错误**: `Notarization failed`

**解决方案**:
- 检查 Apple ID 和密码是否正确
- 确保使用的是 App 专用密码，不是 Apple ID 密码
- 检查 Team ID 是否正确
- 查看详细错误日志

### 3. Hardened Runtime 问题

**错误**: 应用在其他 Mac 上无法运行

**解决方案**:
- 检查 `build/entitlements.mac.plist` 配置
- 确保包含必要的 entitlements
- 重新构建并公证

### 4. 跳过公证（仅用于测试）

如果不需要公证（仅本地测试），可以移除或注释 `package.json` 中的 `afterSign` 配置：

```json
{
  "build": {
    // "afterSign": "scripts/notarize.js"  // 注释此行
  }
}
```

## CI/CD 集成

在 CI/CD 环境中（如 GitHub Actions），将敏感信息存储为 secrets：

```yaml
env:
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  CSC_LINK: ${{ secrets.CSC_LINK }}  # Base64 编码的证书
  CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}  # 证书密码
```

## 发布检查清单

- [ ] 已设置所有必需的环境变量
- [ ] 签名证书已正确安装
- [ ] 应用版本号已更新（package.json）
- [ ] 构建成功完成
- [ ] 签名验证通过
- [ ] 公证成功完成
- [ ] 在干净的 macOS 系统上测试安装
- [ ] 验证应用可以正常打开和运行

## 更多资源

- [Apple 代码签名文档](https://developer.apple.com/support/code-signing/)
- [Apple 公证文档](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [electron-builder 文档](https://www.electron.build/configuration/mac)
- [@electron/notarize](https://github.com/electron/notarize)
