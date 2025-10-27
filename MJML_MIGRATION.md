# GrapesJS MJML Plugin Integration

## Overview

The email builder has been successfully migrated from custom HTML blocks to MJML blocks using the official `grapesjs-mjml` plugin. MJML (Mailjet Markup Language) is a responsive email framework that makes it easier to create email templates that work across all email clients.

## What Changed

### 1. **Plugin Installation**
- Installed `grapesjs-mjml` version 1.0.7 via pnpm
- The plugin provides all the MJML components and features out of the box

### 2. **Email Editor Component Updates**

#### Imports
```typescript
import grapesjsMJML from 'grapesjs-mjml';
```

#### Editor Initialization
- Removed custom HTML blocks configuration
- Added MJML plugin to GrapesJS initialization:
```typescript
plugins: [grapesjsMJML],
pluginsOpts: {
  [grapesjsMJML as any]: {
    resetBlocks: true,
    resetDevices: true,
    resetStyleManager: true,
    hideSelector: true,
    columnsPadding: '10px 0',
    useCustomTheme: true,
    imagePlaceholderSrc: 'https://via.placeholder.com/350x250/78c5d6/fff',
    overwriteExport: false,
  }
}
```

#### Removed Custom Code
- Removed all custom HTML block definitions from `email-blocks.config.ts`
- Removed custom component types (`flexible-columns`, `email-column-div`)
- Removed custom column handling logic (~600+ lines of code)
- Removed custom column selection and update methods

### 3. **Updated Commands**

#### Import Template
- Now supports both MJML and HTML templates
- Automatically detects MJML format
- Wraps HTML content in basic MJML structure if needed

#### Export Template
- Uses MJML's built-in HTML compilation
- Exports production-ready HTML with inlined styles
- No need for external juice library for CSS inlining (MJML handles this)

#### Clear Canvas
- Resets to a basic MJML template instead of empty canvas

### 4. **Styling**
- Imported GrapesJS base CSS only
- MJML plugin styles are included in the JavaScript bundle

## Available MJML Components

The plugin provides the following MJML components (default blocks):

### Structure
- `mj-body` - Email body container
- `mj-section` - Full-width section
- `mj-column` - Column within a section
- `mj-group` - Group columns together
- `mj-wrapper` - Wrapper for sections

### Content
- `mj-text` - Text content
- `mj-image` - Responsive images
- `mj-button` - Email-safe buttons
- `mj-divider` - Horizontal divider
- `mj-spacer` - Vertical spacing

### Social
- `mj-social` - Social media icons container
- `mj-social-element` - Individual social icon

### Advanced
- `mj-hero` - Hero section with background image
- `mj-navbar` - Navigation bar
- `mj-navbar-link` - Navigation link
- `mj-raw` - Raw HTML content
- `mj-style` - Custom CSS styles
- `mj-font` - Custom font imports

## Benefits of MJML

1. **Better Email Client Compatibility**
   - MJML automatically generates responsive, email-client-safe HTML
   - Works in Outlook, Gmail, Apple Mail, and other clients
   - No need for manual table-based layouts

2. **Simplified Development**
   - Cleaner, more maintainable code
   - ~600+ lines of custom column logic removed
   - Built-in responsive behavior

3. **Professional Templates**
   - Industry-standard approach
   - Well-tested components
   - Active community support

4. **Built-in Features**
   - Automatic CSS inlining
   - Responsive design by default
   - Outlook VML support
   - Mobile optimization

## How to Use

### Creating a New Email
1. Open the email editor
2. Drag MJML components from the left panel
3. Configure components using the right panel (traits/styles)
4. Preview in different devices (desktop/tablet/mobile)
5. Export to get production-ready HTML

### Template Structure
All MJML templates follow this basic structure:
```xml
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <!-- Your content here -->
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

### Importing Templates
- Paste MJML code directly
- Or paste HTML (will be wrapped in MJML structure)

### Exporting Templates
- Click Export to download production-ready HTML
- HTML includes inlined CSS for maximum compatibility
- Ready to send via any email service provider

## Testing

The application successfully:
- ✅ Builds without errors
- ✅ Starts development server
- ✅ Available at http://localhost:4200/

## Resources

- [MJML Official Documentation](https://mjml.io/documentation/)
- [GrapesJS MJML Plugin](https://github.com/GrapesJS/mjml)
- [MJML Try It Live](https://mjml.io/try-it-live)

## Notes

- The `juice` library is no longer needed for CSS inlining as MJML handles this
- All existing templates can be imported if they're in MJML format
- HTML templates will be automatically wrapped in basic MJML structure
