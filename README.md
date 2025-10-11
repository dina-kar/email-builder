# C1X Email Builder

A professional no-code email builder application with a modern Angular frontend and NestJS backend.

## 🎯 Features

- **Intuitive Interface**: Drag & drop blocks from the left panel
- **Advanced Styling**: Comprehensive style manager on the right panel
- **Rich Text Editor**: Secure CKEditor 4.25.1-lts integration
- **Responsive Design**: Build mobile-friendly email templates
- **Template Management**: Save, load, and export HTML templates
- **Asset Management**: Handle images and media files

## 🏗️ Architecture

### Frontend
- **Framework**: Angular 20.3.0
- **Email Builder**: GrapesJS 0.21.10 with Newsletter Preset
- **Text Editor**: CKEditor 4.25.1-lts (secure version)
- **Package Manager**: pnpm

### Backend
- **Framework**: NestJS
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm

### Installation

1. Clone the repository
2. Install frontend dependencies:
```bash
cd frontend
pnpm install
```

3. Install backend dependencies:
```bash
cd backend
pnpm install
```

### Running the Application

**Frontend:**
```bash
cd frontend
pnpm start
# or
ng serve
```
Navigate to `http://localhost:4200/`

**Backend:**
```bash
cd backend
pnpm start:dev
```

## 🔒 Security

- ✅ Updated CKEditor from 4.21.0 to **4.25.1-lts** (latest secure version)
- Removed vulnerable dependencies
- Following security best practices

## 📐 Layout Configuration

- **Left Sidebar**: Blocks and elements panel for drag & drop
- **Center Canvas**: Email template editing area
- **Right Sidebar**: Style manager and component settings

## 🎨 Branding

The application is branded as **C1X Email Builder** with:
- Custom logo and version display
- Updated UI elements and labels
- Professional color scheme

## 📝 License

Proprietary - C1X Technology

## 🛠️ Development

Built with modern web technologies for performance and reliability.
