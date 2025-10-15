# Email Builder API Documentation

Base URL: `http://localhost:3000/api`

## Templates API

### 1. Create Template

**Endpoint:** `POST /templates`

**Description:** Create a new email template

**Request Body:**
```json
{
  "name": "Welcome Email",
  "description": "Welcome email for new users",
  "html": "<div>Welcome!</div>",
  "css": "div { color: blue; }",
  "components": {
    "type": "wrapper",
    "components": []
  },
  "styles": {
    "wrapper": {
      "background-color": "#ffffff"
    }
  },
  "assets": [
    "assets/uuid-1.png",
    "assets/uuid-2.jpg"
  ],
  "thumbnail": "thumbnails/uuid-thumb.png",
  "status": "draft",
  "metadata": {
    "author": "John Doe",
    "version": "1.0"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Welcome Email",
  "description": "Welcome email for new users",
  "html": "<div>Welcome!</div>",
  "css": "div { color: blue; }",
  "components": {
    "type": "wrapper",
    "components": []
  },
  "styles": {
    "wrapper": {
      "background-color": "#ffffff"
    }
  },
  "assets": [
    "assets/uuid-1.png",
    "assets/uuid-2.jpg"
  ],
  "thumbnail": "thumbnails/uuid-thumb.png",
  "status": "draft",
  "metadata": {
    "author": "John Doe",
    "version": "1.0"
  },
  "createdAt": "2025-10-14T10:30:00.000Z",
  "updatedAt": "2025-10-14T10:30:00.000Z"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Email",
    "description": "Welcome email for new users",
    "html": "<div>Welcome!</div>",
    "css": "div { color: blue; }",
    "status": "draft"
  }'
```

---

### 2. Get All Templates

**Endpoint:** `GET /templates`

**Description:** Retrieve all email templates (ordered by last updated)

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Welcome Email",
    "description": "Welcome email for new users",
    "html": "<div>Welcome!</div>",
    "css": "div { color: blue; }",
    "components": {},
    "styles": {},
    "assets": [],
    "thumbnail": null,
    "status": "draft",
    "metadata": {},
    "createdAt": "2025-10-14T10:30:00.000Z",
    "updatedAt": "2025-10-14T10:30:00.000Z"
  }
]
```

**CURL Example:**
```bash
curl -X GET http://localhost:3000/api/templates
```

---

### 3. Get Template by ID

**Endpoint:** `GET /templates/:id`

**Description:** Retrieve a specific template by its ID

**Path Parameters:**
- `id` (UUID): Template ID

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Welcome Email",
  "description": "Welcome email for new users",
  "html": "<div>Welcome!</div>",
  "css": "div { color: blue; }",
  "components": {},
  "styles": {},
  "assets": [],
  "thumbnail": null,
  "status": "draft",
  "metadata": {},
  "createdAt": "2025-10-14T10:30:00.000Z",
  "updatedAt": "2025-10-14T10:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Template with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:3000/api/templates/550e8400-e29b-41d4-a716-446655440000
```

---

### 4. Update Template

**Endpoint:** `PATCH /templates/:id`

**Description:** Update an existing template (partial update)

**Path Parameters:**
- `id` (UUID): Template ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Welcome Email",
  "description": "Updated description",
  "html": "<div>Updated content</div>",
  "status": "published"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Welcome Email",
  "description": "Updated description",
  "html": "<div>Updated content</div>",
  "css": "div { color: blue; }",
  "components": {},
  "styles": {},
  "assets": [],
  "thumbnail": null,
  "status": "published",
  "metadata": {},
  "createdAt": "2025-10-14T10:30:00.000Z",
  "updatedAt": "2025-10-14T11:45:00.000Z"
}
```

**CURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/templates/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Welcome Email",
    "status": "published"
  }'
```

---

### 5. Delete Template

**Endpoint:** `DELETE /templates/:id`

**Description:** Delete a template and all associated assets from S3

**Path Parameters:**
- `id` (UUID): Template ID

**Response:** `200 OK` (empty response)

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Template with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/templates/550e8400-e29b-41d4-a716-446655440000
```

---

## Asset Upload API

### 6. Upload Asset File

**Endpoint:** `POST /templates/upload/asset`

**Description:** Upload an asset file (image, etc.) to S3

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File to upload

**Response:** `201 Created`
```json
{
  "key": "assets/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png",
  "url": "http://localhost:4566/email-templates-assets/assets/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3000/api/templates/upload/asset \
  -F "file=@/path/to/image.png"
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/templates/upload/asset', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Asset uploaded:', data.url);
  console.log('S3 Key:', data.key);
});
```

---

### 7. Upload Thumbnail

**Endpoint:** `POST /templates/upload/thumbnail`

**Description:** Upload a thumbnail image for a template

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Thumbnail image file

**Response:** `201 Created`
```json
{
  "key": "thumbnails/b2c3d4e5-f6g7-8901-bcde-f12345678901.jpg",
  "url": "http://localhost:4566/email-templates-assets/thumbnails/b2c3d4e5-f6g7-8901-bcde-f12345678901.jpg"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3000/api/templates/upload/thumbnail \
  -F "file=@/path/to/thumbnail.jpg"
```

---

### 8. Upload Base64 Image

**Endpoint:** `POST /templates/upload/base64-image`

**Description:** Upload a base64 encoded image to S3

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

**Response:** `201 Created`
```json
{
  "key": "images/c3d4e5f6-g7h8-9012-cdef-123456789012.png",
  "url": "http://localhost:4566/email-templates-assets/images/c3d4e5f6-g7h8-9012-cdef-123456789012.png"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3000/api/templates/upload/base64-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**JavaScript Example:**
```javascript
// Convert canvas to base64
const canvas = document.getElementById('myCanvas');
const base64Image = canvas.toDataURL('image/png');

fetch('http://localhost:3000/api/templates/upload/base64-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ image: base64Image })
})
.then(response => response.json())
.then(data => {
  console.log('Image uploaded:', data.url);
});
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "html must be a string"
  ],
  "error": "Bad Request"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Template with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Integration with Frontend

### Example: Save Template from GrapesJS

```javascript
// In your Angular/GrapesJS component
async saveTemplate() {
  const editor = this.editor; // GrapesJS editor instance
  
  // Get template data from GrapesJS
  const templateData = {
    name: 'My Email Template',
    description: 'Description here',
    html: editor.getHtml(),
    css: editor.getCss(),
    components: editor.getComponents(),
    styles: editor.getStyle(),
    assets: editor.AssetManager.getAll().map(asset => asset.get('src')),
    status: 'draft'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });
    
    const savedTemplate = await response.json();
    console.log('Template saved:', savedTemplate.id);
  } catch (error) {
    console.error('Failed to save template:', error);
  }
}
```

### Example: Load Template into GrapesJS

```javascript
async loadTemplate(templateId: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/templates/${templateId}`);
    const template = await response.json();
    
    // Load into GrapesJS
    this.editor.setComponents(template.html);
    this.editor.setStyle(template.css);
    
    console.log('Template loaded');
  } catch (error) {
    console.error('Failed to load template:', error);
  }
}
```

---

## Testing with Postman

Import this collection to test all endpoints:

1. Create a new Collection in Postman
2. Add requests for each endpoint above
3. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000/api`
4. Test CRUD operations

---

## S3 Asset URLs

In development (LocalStack):
- Format: `http://localhost:4566/{bucket}/{key}`
- Example: `http://localhost:4566/email-templates-assets/assets/uuid.png`

In production (AWS S3):
- Format: `https://s3.{region}.amazonaws.com/{bucket}/{key}`
- Or with CloudFront: `https://{cloudfront-domain}/{key}`

---

## Notes

- All IDs are UUIDs
- Timestamps are in ISO 8601 format
- JSONB fields accept any valid JSON
- File uploads are limited to 10MB (configurable)
- Assets are automatically deleted when template is deleted
- CORS is enabled for `http://localhost:4200` and `http://localhost:3000`
