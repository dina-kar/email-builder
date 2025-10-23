# 📧 Email Template Builder

A full-stack email template builder application with drag-and-drop functionality, built with Angular (frontend) and NestJS (backend).

## ✨ Features

### Frontend (Angular + GrapesJS)
- 🎨 **Drag & Drop Editor** - Intuitive visual email template builder using GrapesJS
- 📱 **Responsive Preview** - Test templates on Desktop, Tablet, and Mobile views
- 🎯 **Pre-built Blocks** - 30+ email-safe components (headers, buttons, layouts, etc.)
- 💾 **Auto-save** - Automatic saving every 30 seconds
- 🖼️ **Template Gallery** - View all templates with edit/delete/duplicate actions
- 📤 **Import/Export** - Import HTML templates or export with inlined CSS
- 🎨 **Live Styling** - Real-time style customization with visual editor

### Backend (NestJS + PostgreSQL + S3)
- 🗄️ **PostgreSQL Database** - Persistent storage for templates
- ☁️ **S3 Integration** - Asset and thumbnail storage (LocalStack for dev)
- 🔐 **Validation** - Input validation with class-validator
- 🛡️ **Error Handling** - Global exception filter for consistent error responses
- 📝 **Logging** - Comprehensive logging for debugging
- 🚀 **RESTful API** - Full CRUD operations for templates

## 🏗️ Architecture

```
email-builder/
├── frontend/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── email-editor/       # GrapesJS email editor component
│   │   │   ├── templates-list/     # Templates gallery component
│   │   │   ├── services/           # API service layer
│   │   │   └── environments/       # Environment configurations
│   └── package.json
│
├── backend/           # NestJS application
│   ├── src/
│   │   ├── templates/             # Templates module (CRUD)
│   │   ├── s3/                    # S3 service for file uploads
│   │   ├── filters/               # Global exception filter
│   │   └── main.ts
│   ├── docker-compose.yml         # PostgreSQL + LocalStack
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Docker & Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd email-builder
```

### 2. Start Backend Services

```bash
cd backend

# Install dependencies
pnpm install

# Start PostgreSQL and LocalStack (S3)
docker-compose up -d

# Create .env file
cp .env.example .env

# Start the backend server
pnpm start:dev
```

The backend will be running at `http://localhost:3000`

### 3. Start Frontend Application

```bash
cd frontend

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

The frontend will be running at `http://localhost:4200`

## 📖 Usage Guide

### Creating a New Template

1. Open `http://localhost:4200` in your browser
2. Click **"New Template"** button
3. Drag and drop blocks from the left sidebar
4. Customize styles in the right sidebar
5. Click **"Save"** button
6. Enter template name and description
7. Template is automatically saved to the database

### Editing an Existing Template

1. From the templates gallery, click **Edit** on any template
2. Make your changes in the editor
3. Changes are auto-saved every 30 seconds
4. Or click **Save** button for immediate save

### Exporting Templates

1. Click the **Export** button in the editor
2. The template will be downloaded as HTML with inlined CSS
3. Ready to use in email marketing platforms

### Device Preview

- Click the device icons in the toolbar to preview:
  - 🖥️ Desktop view
  - 📱 Tablet view
  - 📱 Mobile view

## 🔧 Configuration

### Frontend Environment

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Backend Environment

Edit `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=email_builder

# S3 (LocalStack)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566
S3_BUCKET=email-templates-assets

# Application
PORT=3000
NODE_ENV=development
```

## 🛠️ API Endpoints

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | Get all templates |
| GET | `/api/templates/:id` | Get template by ID |
| POST | `/api/templates` | Create new template |
| PATCH | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |

### File Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/templates/upload/asset` | Upload asset file |
| POST | `/api/templates/upload/thumbnail` | Upload thumbnail |
| POST | `/api/templates/upload/base64-image` | Upload base64 image |

## 📦 Tech Stack

### Frontend
- **Angular 20** - Modern web framework
- **GrapesJS** - Drag & drop editor
- **Juice** - CSS inliner for emails
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **AWS SDK** - S3 integration
- **LocalStack** - Local AWS simulation
- **class-validator** - DTO validation

## 🔍 Available Scripts

### Frontend

```bash
pnpm start          # Start dev server
pnpm build          # Build for production
pnpm test           # Run tests
pnpm watch          # Build and watch for changes
```

### Backend

```bash
pnpm start:dev      # Start in development mode
pnpm start:prod     # Start in production mode
pnpm build          # Build the application
pnpm test           # Run tests
pnpm docker:up      # Start Docker services
pnpm docker:down    # Stop Docker services
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure Docker is running
- Check if ports 3000, 5432, and 4566 are available
- Verify `.env` file exists with correct values

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check CORS settings in `backend/src/main.ts`
- Verify API URL in environment files

### Database connection issues
- Check if PostgreSQL container is running: `docker ps`
- Verify database credentials in `.env`
- Check database logs: `docker logs email-builder-postgres`

### S3/Asset upload issues
- Check if LocalStack is running: `docker ps`
- Verify S3 bucket exists: `pnpm s3:ls`
- Check LocalStack logs: `docker logs localstack`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [GrapesJS](https://grapesjs.com/) - Amazing drag & drop editor
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Angular](https://angular.io/) - Platform for building web applications

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using Angular & NestJS
