# MJML Quick Start Guide

## What is MJML?

MJML is a markup language designed to reduce the pain of coding responsive emails. It provides a semantic syntax that makes it easy to create beautiful, responsive emails that work across all email clients.

## Basic MJML Components

### 1. Layout Components

#### mj-section
Creates a full-width section (horizontal container):
```xml
<mj-section background-color="#f0f0f0" padding="20px">
  <!-- Columns go here -->
</mj-section>
```

#### mj-column
Creates columns within a section:
```xml
<mj-section>
  <mj-column width="50%">
    <!-- Content -->
  </mj-column>
  <mj-column width="50%">
    <!-- Content -->
  </mj-column>
</mj-section>
```

### 2. Content Components

#### mj-text
For text content:
```xml
<mj-text 
  font-size="16px" 
  color="#333333"
  align="center">
  Your text here
</mj-text>
```

#### mj-image
For images:
```xml
<mj-image 
  src="https://example.com/image.jpg" 
  alt="Description"
  width="600px" />
```

#### mj-button
For email-safe buttons:
```xml
<mj-button 
  background-color="#F59E0B" 
  color="#ffffff"
  href="https://example.com">
  Click Me
</mj-button>
```

#### mj-divider
For horizontal lines:
```xml
<mj-divider border-color="#cccccc" border-width="1px" />
```

#### mj-spacer
For vertical spacing:
```xml
<mj-spacer height="20px" />
```

### 3. Social Components

#### mj-social
Social media icons:
```xml
<mj-social mode="horizontal">
  <mj-social-element name="facebook" href="https://facebook.com/yourpage" />
  <mj-social-element name="twitter" href="https://twitter.com/yourhandle" />
  <mj-social-element name="instagram" href="https://instagram.com/yourprofile" />
</mj-social>
```

### 4. Advanced Components

#### mj-hero
Hero section with background image:
```xml
<mj-hero
  mode="fluid-height"
  background-width="600px"
  background-height="400px"
  background-url="https://example.com/hero.jpg"
  background-color="#2a3448"
  padding="100px 0px">
  <mj-text 
    padding="20px" 
    color="#ffffff" 
    font-size="45px"
    align="center">
    Welcome!
  </mj-text>
</mj-hero>
```

#### mj-navbar
Navigation bar:
```xml
<mj-navbar base-url="https://example.com">
  <mj-navbar-link href="/home">Home</mj-navbar-link>
  <mj-navbar-link href="/about">About</mj-navbar-link>
  <mj-navbar-link href="/contact">Contact</mj-navbar-link>
</mj-navbar>
```

## Common Patterns

### 1. Simple Email Template
```xml
<mjml>
  <mj-body background-color="#f5f5f5">
    <!-- Header -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image src="https://example.com/logo.png" width="200px" />
      </mj-column>
    </mj-section>

    <!-- Content -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="24px" color="#333333">
          Hello World!
        </mj-text>
        <mj-text font-size="16px" color="#666666" line-height="24px">
          This is a simple email template built with MJML.
        </mj-text>
        <mj-button background-color="#F59E0B" href="https://example.com">
          Learn More
        </mj-button>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="#333333" padding="20px">
      <mj-column>
        <mj-text color="#ffffff" align="center" font-size="14px">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

### 2. Two-Column Layout
```xml
<mj-section>
  <mj-column width="50%" padding="10px">
    <mj-image src="https://example.com/product1.jpg" />
    <mj-text font-size="18px" font-weight="bold">Product 1</mj-text>
    <mj-text font-size="14px">$99.99</mj-text>
  </mj-column>
  
  <mj-column width="50%" padding="10px">
    <mj-image src="https://example.com/product2.jpg" />
    <mj-text font-size="18px" font-weight="bold">Product 2</mj-text>
    <mj-text font-size="14px">$79.99</mj-text>
  </mj-column>
</mj-section>
```

### 3. Three-Column Layout
```xml
<mj-section>
  <mj-column width="33.33%">
    <mj-text>Column 1</mj-text>
  </mj-column>
  <mj-column width="33.33%">
    <mj-text>Column 2</mj-text>
  </mj-column>
  <mj-column width="33.33%">
    <mj-text>Column 3</mj-text>
  </mj-column>
</mj-section>
```

## Common Attributes

### Universal Attributes (work on most components)
- `padding` - Inner spacing (e.g., "20px" or "10px 20px")
- `background-color` - Background color (hex, rgb, or named)
- `border` - Border style (e.g., "1px solid #cccccc")
- `border-radius` - Rounded corners (e.g., "5px")

### Text Attributes
- `font-size` - Text size (e.g., "16px")
- `color` - Text color
- `font-family` - Font (e.g., "Arial, sans-serif")
- `font-weight` - Weight (e.g., "bold", "400", "700")
- `line-height` - Line spacing (e.g., "24px")
- `align` - Alignment ("left", "center", "right")

### Image Attributes
- `src` - Image URL
- `alt` - Alternative text
- `width` - Image width
- `height` - Image height
- `href` - Make image clickable

### Button Attributes
- `href` - Link URL
- `background-color` - Button background
- `color` - Text color
- `border-radius` - Rounded corners
- `font-size` - Text size
- `padding` - Inner spacing

## Tips for Email Design

1. **Keep it Simple**: Email clients have limited CSS support
2. **Use Web Fonts Carefully**: Not all email clients support them
3. **Test Across Clients**: Use tools like Litmus or Email on Acid
4. **Mobile First**: Most emails are read on mobile devices
5. **Maximum Width**: Keep email width at 600px for best compatibility
6. **Accessible**: Use alt text, sufficient color contrast, and semantic markup

## Testing Your Emails

1. **Preview in Editor**: Use the device switcher (desktop/tablet/mobile)
2. **Export HTML**: Click export to get production-ready code
3. **Send Test**: Send to yourself and check in different email clients
4. **Validate**: Use MJML validator to check for errors

## Resources

- [MJML Documentation](https://documentation.mjml.io/)
- [MJML Try It Live](https://mjml.io/try-it-live)
- [Email Client Support](https://www.caniemail.com/)
- [MJML Component Library](https://documentation.mjml.io/#components)

## Need Help?

- Check the MJML documentation
- Use the "Import Template" feature to see example code
- Start with simple layouts and build up complexity
- The preview shows exactly how your email will look
