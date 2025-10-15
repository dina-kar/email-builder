# How to Import Templates into the Email Builder

## The Issue You Encountered

You tried to import a **complete HTML file** that contains the full GrapesJS setup, but our Angular email builder only needs the **email template content** (the actual HTML that will be sent in emails).

## Solution: Three Ways to Use Templates

### ✅ 1. Use the Sample Button (Easiest)

Click the **"Sample"** button in the toolbar to load a pre-built professional email template.

**Steps:**
1. Open the email builder
2. Click the **"Sample"** button in the top toolbar
3. Confirm to replace current work
4. Done! A beautiful email template is loaded

---

### ✅ 2. Import Just the Email HTML

When you have a full HTML document, **extract only the email table content** before importing.

**From your HTML file, copy ONLY this part:**

```html
<table cellpadding="0" cellspacing="0" width="100%" style="background:#f1f3f5;padding:40px 0;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;">
        <!-- Your email content here -->
      </table>
    </td>
  </tr>
</table>
```

**Steps:**
1. Click **"Import"** button
2. Paste ONLY the table content (not `<html>`, `<head>`, `<body>` tags)
3. Click "Import"
4. Done!

---

### ✅ 3. Use the Enhanced Import (Auto-Extract)

Our updated import function now automatically extracts body content from full HTML documents!

**Steps:**
1. Click **"Import"** button
2. Paste the ENTIRE HTML file (including `<!doctype>`, `<html>`, etc.)
3. The system will automatically extract the `<body>` content
4. Click "Import"
5. Done!

---

## What Changed

### Before (❌ Didn't Work):
- Pasting full HTML with `<html>`, `<head>`, `<script>` tags
- GrapesJS couldn't parse it
- Screen stayed blank

### After (✅ Works Now):
- **Auto-extraction** of body content from full HTML
- **Sample template** button for quick start
- Clear instructions in import modal

---

## The Sample Template

The pre-loaded template includes:

✅ **Header Section**
- Logo/brand image
- Headline and description

✅ **Hero Section**
- Large feature image
- Call-to-action button

✅ **Two-Column Layout**
- Side-by-side content blocks
- Images with descriptions

✅ **CTA Section**
- Primary action button

✅ **Footer Section**
- Company info
- Unsubscribe link
- Social links placeholder

---

## Import Examples

### ❌ DON'T Import (Full Document):
```html
<!doctype html>
<html>
<head>
  <script src="grapesjs.js"></script>
</head>
<body>
  <table>...</table>
</body>
</html>
```

### ✅ DO Import (Email Content Only):
```html
<table cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td>
      Your email content...
    </td>
  </tr>
</table>
```

### ✅ NOW WORKS (Auto-Extract):
Both formats work now! The system will automatically extract the body content.

---

## Testing Your Changes

### 1. Start the Frontend
```bash
cd /home/balaji/Desktop/email-builder/frontend
pnpm start
```

### 2. Open Browser
Navigate to: http://localhost:4200

### 3. Try the Sample Button
1. Click **"Sample"** in the toolbar
2. See the template load instantly
3. Edit any component
4. Drag new blocks from the left panel

### 4. Try Import
1. Click **"Import"** button
2. Paste any email HTML (with or without full document tags)
3. Click "Import"
4. See it load correctly

---

## New Toolbar Buttons

| Button | Icon | Function |
|--------|------|----------|
| **Sample** | 📄 article | Load sample template |
| **Import** | ⬆️ upload | Import HTML (enhanced) |
| **Export** | 💻 code | Export HTML |
| **Save** | 💾 save | Save template |

---

## Tips for Best Results

### Email-Friendly HTML
✅ Use tables for layout (not divs)  
✅ Use inline styles  
✅ Keep width at 600px  
✅ Use web-safe fonts  

### When Importing
✅ Remove JavaScript  
✅ Remove complex CSS  
✅ Use inline styles only  
✅ Test in preview mode  

---

## Troubleshooting

### Problem: Nothing shows after import
**Solution:** Make sure you're importing table-based HTML, not div-based layouts.

### Problem: Styles don't apply
**Solution:** Use inline styles. External CSS won't work in emails.

### Problem: Layout breaks in preview
**Solution:** Email clients don't support modern CSS. Use table layouts.

---

## Files Modified

1. **email-builder.component.ts**
   - Added `loadDefaultTemplate()` method with professional sample
   - Enhanced `import-template` command with auto-extraction
   - Added `loadSampleTemplate()` method

2. **email-builder.component.html**
   - Added "Sample" button to toolbar

---

## What You Get

- 🎨 Professional email template ready to customize
- 📥 Smart import that handles any HTML format
- 🚀 One-click sample loading
- ✨ Better user experience

**Now you can start creating beautiful emails right away!** 🎉
