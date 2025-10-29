# Email Sending Feature

## Overview
The email builder now supports sending emails directly from the editor. The system uses MJML to ensure responsive emails that render properly across all email clients.

## How It Works

### Backend (NestJS)
1. **Email Module** (`backend/src/email/`)
   - `email.service.ts`: Handles MJML compilation and email sending using Nodemailer
   - `email.controller.ts`: Provides REST API endpoints for sending emails
   - Uses MJML compiler to convert MJML to production-ready responsive HTML

2. **MJML Compilation**
   - MJML code is compiled server-side for consistent results
   - Automatically generates responsive HTML with inlined CSS
   - Ensures compatibility across all email clients (Gmail, Outlook, Apple Mail, etc.)

3. **Email Configuration** (`.env`)
   ```env
   EMAIL_FROM=kondaidina@gmail.com
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=kondaidina@gmail.com
   EMAIL_SERVER_PASSWORD=efawvhcqeyitnoqx
   ```

### Frontend (Angular)
1. **Send Email Button**: Added to the email editor toolbar
2. **Send Email Dialog**: 
   - Subject line (pre-filled from email metadata)
   - Recipients (comma or newline separated)
   - Real-time validation
   - Success/error feedback

3. **MJML to HTML Workflow**:
   - Editor stores templates as MJML
   - When sending, MJML is sent to backend
   - Backend compiles MJML → Responsive HTML
   - Email is sent with production-ready HTML

## API Endpoints

### 1. Send Test Email
```bash
POST /api/email/send-test
Content-Type: application/json

{
  "recipients": ["email1@example.com", "email2@example.com"]  // Optional
}
```

**Default Recipients** (if not specified):
- theoldmanofgod@gmail.com
- dinakaranvijayakumar@outlook.com

### 2. Send Custom Email
```bash
POST /api/email/send
Content-Type: application/json

{
  "recipients": ["user@example.com"],
  "subject": "Welcome to Our Newsletter",
  "mjmlContent": "<mjml>...</mjml>"
}
```

### 3. Verify Email Connection
```bash
GET /api/email/verify
```

## Features

### ✅ MJML Compilation
- Server-side MJML to HTML conversion
- Generates responsive layouts
- Inlines CSS for email client compatibility
- Handles complex column layouts properly

### ✅ Email Metadata
- Subject line support via `<mj-title>`
- Preview text support via `<mj-preview>`
- Automatically injected into emails

### ✅ Multi-Recipient Support
- Send to multiple recipients
- Email validation
- Comma or newline separated addresses

### ✅ Error Handling
- Clear error messages
- Validation feedback
- Connection verification

## Usage

### From the Email Editor:

1. **Create your email template** using the drag-and-drop MJML builder
2. **Add email metadata**:
   - Subject Line: Appears in the inbox
   - Preview Text: Shows next to subject in email clients
3. **Click "Send Email"** button in the toolbar
4. **Fill in the dialog**:
   - Subject (pre-filled from metadata)
   - Recipients (one per line or comma-separated)
5. **Click "Send Email"** button in the dialog
6. **Wait for confirmation** - you'll see a success message

### Example MJML Structure:
```xml
<mjml>
  <mj-head>
    <mj-title>Your Email Subject</mj-title>
    <mj-preview>Preview text shown in inbox</mj-preview>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text>Your content here</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

## Why MJML?

MJML (Mailjet Markup Language) is a responsive email framework that:
- Generates responsive HTML tables for email clients
- Handles Outlook quirks automatically
- Ensures consistent rendering across 20+ email clients
- Uses semantic components instead of complex HTML
- Automatically inlines CSS
- Creates mobile-friendly layouts

## Testing

### Test Email Endpoint:
```bash
# Using curl
curl -X POST http://localhost:3000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{}'

# Or use the provided test script
cd backend
bash test-email.sh
```

### Verify Email Configuration:
```bash
curl http://localhost:3000/api/email/verify
```

## Troubleshooting

### Email not sending?
1. Check `.env` file has correct SMTP credentials
2. Verify email server connection: `GET /api/email/verify`
3. Check backend logs for errors
4. Ensure Gmail "App Password" is used (not regular password)

### Layout issues in email?
- MJML compilation ensures responsive layouts
- All CSS is automatically inlined
- Tables are used for Outlook compatibility
- Test in multiple clients using tools like Litmus or Email on Acid

### Invalid recipient errors?
- Ensure email addresses are properly formatted
- Check for extra spaces or special characters
- Use comma or newline to separate multiple addresses

## Security Notes

- Never commit `.env` file with real credentials
- Use environment-specific configuration
- Consider rate limiting for production
- Validate all email addresses server-side
- Use SMTP authentication
- Enable TLS/SSL for secure transmission

## Future Enhancements

- [ ] Email scheduling
- [ ] A/B testing support
- [ ] Email analytics tracking
- [ ] Attachment support
- [ ] Template variables/personalization
- [ ] Send to contact lists
- [ ] Email preview across clients
- [ ] Bounce handling
