# Email Builder - Full Stack Application

A complete email template builder application with Angular frontend (GrapesJS) and NestJS backend with PostgreSQL and S3 storage.

## �️ Architecture

```
email-builder/
├── frontend/          # Angular 20 + GrapesJS email builder
│   ├── src/
│   │   ├── app/
│   │   │   ├── email-builder/    # Main editor component
│   │   │   └── services/         # API services
│   │   └── ...
│   └── ...
│
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── templates/            # Templates CRUD module
│   │   ├── s3/                   # S3 storage service
│   │   └── ...
│   ├── docker-compose.yml        # PostgreSQL + LocalStack
│   └── ...
│
└── README.md         # This file
```

## ✨ Features

### Frontend
- 📧 Drag-and-drop email template builder (GrapesJS)
- 🎨 Visual component editing with CKEditor
- 📱 Responsive device preview (Desktop/Tablet/Mobile)
- 💾 Local storage with backend sync
- 🖼️ Asset management with S3 upload
- 📤 HTML/CSS export
- 🎯 Custom blocks and components

### Backend
- 🔐 RESTful API with validation
- 🗄️ PostgreSQL database with TypeORM
- 📦 S3 asset storage (LocalStack for dev)
- 🖼️ Multi-format image upload support
- 🔄 Automatic asset cleanup
- 📝 Comprehensive logging
- 🐳 Dockerized services

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
