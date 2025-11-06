<div align="center">
  <img src="assets\ai_logo.jpeg" alt="LOGO">
</div>

<div align="center">
  <h4>
    <a href="README.md">🇨🇳 Chinese</a>
    <span> | </span>
    <a href="README_EN.md">🇬🇧 English</a>
  </h4>
</div>

A simple two-column Markdown editor that supports real-time preview and WeChat official account style export.

Online use: https://xdxsb.top/FreeEditor

windows download: https://github.com/zstar1003/FreeEditor/releases/download/v1.0.0/FreeEditor.Setup.1.0.0.exe

mac download: https://github.com/zstar1003/FreeEditor/releases/download/v1.0.0/FreeEditor-1.0.0-arm64.dmg

## ✨ Features

- 📝 **Real-time preview** - Look while writing, what you see is what you get
- 🎨 **Rich Style Library** - Built-in multiple exquisite title, code, and quote block styles
- 📱 **Mobile preview** - Supports mobile phone view preview and adapts to WeChat public accounts
- 📋 **One-click copy** - Copy rich text directly and paste it into the WeChat official account editor
- 🌓 **Theme Switch** - Support dark/light theme
- 📂 **Folder Management** - Supports folder classification management documents, drag and drop to move files
- 🖼️ **Image Upload** - Supports dragging/pasting to upload images to Alibaba Cloud OSS
- ⌨️ **Shortcut key support** - Rich editing shortcut keys to improve editing efficiency
- 🔄 **Undo/Redo** - Supports editing history, Ctrl+Z to undo operations
- ✏️ **Formatting Toolbar** - Select text to quickly format it
- 💾 **Local Storage** - Automatically save, data is stored locally
- 🔧 **Backup and Restore** - Supports data export and import
- 🖥️ **Electron support** - can be packaged into desktop applications

## 🚀 Quick Start

### Install dependencies

```bash
npm install
```

### Development mode

```bash
#webdevelopment
npm rundev

#ElectronDevelopment
npm run electron:dev
```

### Build

```bash
#Web build
npm run build

# Electron build
npm run electron:build
```

## 📖 Function description

### Shortcut keys

The editor supports the following shortcut keys:

- **Ctrl+B** / **Cmd+B** - Bold selected text
- **Ctrl+I** / **Cmd+I** - italicize selected text
- **Ctrl+U** / **Cmd+U** - Underline selected text
- **Ctrl+Z** / **Cmd+Z** - Undo the previous operation
- **Ctrl+Shift+Z** / **Cmd+Shift+Z** - Redo
- **Ctrl+Y** / **Cmd+Y** - Redo
- **Tab** - insert indent

### Image upload

After configuring Alibaba Cloud OSS, you can:

1. Paste the image directly into the editor
2. Drag the image to the editor
3. Automatically upload and insert Markdown image syntax

Configure OSS information in settings:

- Region
- AccessKey ID
-AccessKey Secret
- Bucket (storage space)

### File management

- Create folder classification management documents
- Drag files to folders
- Right click on the file/folder: rename, download, delete
- Right click on the blank area: create new file, create new folder
- Automatically save to local storage
- Support file and folder download (folder export as ZIP)

### Export to WeChat official account

1. Select the appropriate style in the preview area
2. Click the Copy button
3. Paste into WeChat public account editor

## 🛠️ Technology stack

- **React 19** - UI framework
- **TypeScript** - type safety
- **Vite** - Build tool
- **Marked** - Markdown parsing
- **Electron** - desktop application
- **Alibaba Cloud OSS** - Image storage

## 📝 Development Instructions

### Project structure

```
md_editor/
├── src/
│ ├── components/ # Components
│ │ ├── Editor.tsx # Editor
│ │ ├── Preview.tsx # Preview area
│ │ ├── Sidebar.tsx # Sidebar
│ │ ├── Settings.tsx # Settings
│ │ └── Modal.tsx # Modal box
│ ├── styles/ # style
│ │ └── themes.ts # style library
│ ├── utils/ # Tools
│ │ └── ossUpload.ts # OSS upload
│ ├── types/ # Type definition
│ ├── App.tsx # Main application
│ └── main.tsx # Entrance
├── electron/ # Electron configuration
├── public/ # Static resources
└── package.json
```

## 📄 License

MIT

## 🤝 Contribute

Issues and Pull Requests are welcome!