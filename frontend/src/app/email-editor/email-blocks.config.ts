/**
 * Email Builder Blocks Configuration
 * 
 * This file contains all the block definitions for the GrapesJS email editor.
 * Blocks are organized by category:
 * - Structure: Layout containers and column systems
 * - Headers: Logo, navigation, hero sections
 * - Content: Text, images, mixed content blocks
 * - Media: Image blocks
 * - Buttons: CTA buttons and banners
 * - Special: Products, orders, coupons, signatures
 * - Footers: Simple and detailed footer variants
 * - Utilities: Preheader, browser links, spacers
 * - Decorations: Dividers and spacers
 * - Social: Social media icons and share buttons
 */

export interface BlockDefinition {
  id: string;
  label: string;
  media: string;
  content: string;
  category: string;
}

export const EMAIL_BLOCKS: BlockDefinition[] = [
  // ========== FLEXIBLE COLUMNS BLOCK ==========
  {
    id: 'flexible-columns',
    label: 'Columns (1-4)',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/></svg>',
    content: `<div data-gjs-type="flexible-columns" data-column-count="2" data-column-align="top" data-column-padding="20" data-bg-color="">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 20px; font-size:0;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="300" valign="top">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:20px;"></td></tr>
              </table>
            </td>
            <td width="300" valign="top">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:20px;"></td></tr>
              </table>
            </td>
          </tr>
        </table>
        <![endif]-->
        <div class="email-column" data-gjs-type="email-column-div" data-column-index="0" style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:20px;"></td></tr>
          </table>
        </div>
        <div class="email-column" data-gjs-type="email-column-div" data-column-index="1" style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:20px;"></td></tr>
          </table>
        </div>
      </td>
    </tr>
  </table>
</div>`,
    category: 'Structure',
  },

  // ========== STRUCTURE BLOCKS (Hybrid / Fluid) ==========
  {
    id: 'email-container',
    label: 'Email Container',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Zm2-14h16v12H4V6Z"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:20px;">
        <!--[if mso]>
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600">
          <tr><td>
        <![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff;">
          <tr><td style="padding: 32px 24px; line-height:1.4; font-family: Arial, sans-serif; color:#111827;"></td></tr>
        </table>
        <!--[if mso]>
          </td></tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>`,
    category: 'Structure',
  },
  
  {
    id: 'sidebar-layout',
    label: 'Sidebar Layout',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h6v18H3V3zm8 0h10v18H11V3z"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 20px; font-size:0;">
        <!--[if mso]><table role="presentation" width="600"><tr><td width="180" valign="top"><![endif]-->
        <div class="email-column" data-gjs-type="email-column-div" style="display:inline-block; vertical-align:top; width:100%; max-width:180px;">
          <table role="presentation" width="100%"><tr><td style="padding:20px; background-color:#f9f9f9;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif;">Sidebar</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="420" valign="top"><![endif]-->
        <div class="email-column" data-gjs-type="email-column-div" style="display:inline-block; vertical-align:top; width:100%; max-width:420px;">
          <table role="presentation" width="100%"><tr><td style="padding:20px;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif;">Main Content</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>`,
    category: 'Structure',
  },

  // ========== HEADER BLOCKS ==========
  {
    id: 'header-logo',
    label: 'Header Logo',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr><td align="center" style="padding:24px 20px;">
      <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
      <table role="presentation" width="100%" style="max-width:600px;">
        <tr><td align="center">
          <img src="https://placehold.co/200x60/F59E0B/FFFFFF?text=Your+Logo" alt="Logo" width="200" style="max-width:200px; width:100%; height:auto; display:block;" />
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>`,
    category: 'Headers',
  },
  
  {
    id: 'header-with-nav',
    label: 'Header + Nav',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h18v4H3v-4z"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr><td align="center" style="padding:16px 20px;">
      <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
      <table role="presentation" width="100%" style="max-width:600px;">
        <tr>
          <td align="left" style="padding:8px 0;">
            <img src="https://placehold.co/150x50/F59E0B/FFFFFF?text=Logo" alt="Logo" width="150" style="display:block; width:150px; height:auto;" />
          </td>
        </tr>
        <tr>
          <td align="right" style="padding:8px 0;">
            <a href="#" style="color:#374151; text-decoration:none; font-size:14px; font-family:Arial, sans-serif; margin-left:16px;">Home</a>
            <a href="#" style="color:#374151; text-decoration:none; font-size:14px; font-family:Arial, sans-serif; margin-left:16px;">About</a>
            <a href="#" style="color:#374151; text-decoration:none; font-size:14px; font-family:Arial, sans-serif; margin-left:16px;">Contact</a>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>`,
    category: 'Headers',
  },

  // ========== HERO WITH OUTLOOK-SAFE BACKGROUND ==========
  {
    id: 'hero-background',
    label: 'Hero Background',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v8h18V3zm0 10H3v8h18v-8z"/></svg>',
    content: `
  <!--[if gte mso 9]>
  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px; height:280px;">
    <v:fill type="frame" src="https://placehold.co/1200x560/1F2937/FFFFFF?text=Hero+BG" color="#1F2937" />
    <v:textbox inset="0,0,0,0">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 20px;">
        <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
        <table role="presentation" width="100%" style="max-width:600px;">
          <tr>
            <td align="center" style="background: url('https://placehold.co/1200x560/1F2937/FFFFFF?text=Hero+BG') #1F2937 center / cover no-repeat; padding:48px 20px;">
              <h1 style="margin:0 0 10px 0; font-family:Arial, sans-serif; font-size:32px; line-height:1.2; color:#ffffff;">Welcome!</h1>
              <p style="margin:0; font-family:Arial, sans-serif; font-size:18px; line-height:1.6; color:#E5E7EB;">Discover amazing products and exclusive offers</p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
  <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->`,
    category: 'Headers',
  },

  // ========== CONTENT ==========
  {
    id: 'image-text-hybrid',
    label: 'Image + Text',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 5v14H5V5h14"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 20px; font-size:0;">
        <!--[if mso]><table role="presentation" width="600"><tr><td width="300" valign="top"><![endif]-->
        <div class="email-column" data-gjs-type="email-column-div" style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%"><tr><td style="padding:20px;">
            <img src="https://placehold.co/600x400/F59E0B/FFFFFF?text=Image" alt="Image" width="560" style="width:100%; max-width:560px; height:auto; display:block;" />
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="300" valign="top"><![endif]-->
        <div class="email-column" data-gjs-type="email-column-div" style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%"><tr><td style="padding:20px;">
            <h3 style="margin:0 0 10px 0; font-family:Arial, sans-serif; font-size:22px; color:#111827;">Feature Title</h3>
            <p style="margin:0; font-family:Arial, sans-serif; font-size:16px; line-height:1.6; color:#374151;">Description of your feature or product goes here. Make it compelling and engaging.</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>`,
    category: 'Content',
  },

  // ========== MEDIA ==========
  {
    id: 'image-fluid',
    label: 'Image',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14"/></svg>',
    content: `
  <table role="presentation" width="100%"><tr><td align="center" style="padding:20px;">
    <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
    <img src="https://placehold.co/600x350/F59E0B/FFFFFF?text=Your+Image" alt="Image" width="600" style="width:100%; max-width:600px; height:auto; display:block;" />
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr></table>`,
    category: 'Media',
  },

  // ========== BUTTONS (Bulletproof) ==========
  {
    id: 'button-bulletproof',
    label: 'Button',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5v18h14z"/></svg>',
    content: `
  <table role="presentation" width="100%"><tr><td align="center" style="padding:20px;">
    <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="#" style="height:48px; v-text-anchor:middle; width:220px;" arcsize="10%" stroke="f" fillcolor="#F59E0B">
        <w:anchorlock/>
        <center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px; font-weight:bold;">Click Here</center>
      </v:roundrect>
    <![endif]-->
    <a href="#"
       style="background-color:#F59E0B; color:#ffffff; display:inline-block; font-family:Arial, sans-serif; font-size:16px; font-weight:bold; line-height:48px; text-align:center; text-decoration:none; border-radius:6px; padding:0 28px; mso-hide:all;">
       Click Here
    </a>
  </td></tr></table>`,
    category: 'Buttons',
  },
  
  {
    id: 'cta-banner',
    label: 'CTA Banner',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v18h18z"/></svg>',
    content: `
  <table role="presentation" width="100%" style="background-color:#F59E0B;">
    <tr><td align="center" style="padding:32px 20px;">
      <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
      <table role="presentation" width="100%" style="max-width:600px;">
        <tr><td align="center">
          <h2 style="margin:0 0 8px 0; font-family:Arial, sans-serif; font-size:26px; color:#ffffff;">Special Offer!</h2>
          <p style="margin:0 0 16px 0; font-family:Arial, sans-serif; font-size:16px; color:#ffffff;">Don't miss out on this limited-time opportunity</p>
          <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="#" style="height:44px; v-text-anchor:middle; width:200px;" arcsize="10%" stroke="f" fillcolor="#ffffff">
              <w:anchorlock/>
              <center style="color:#F59E0B; font-family:Arial, sans-serif; font-size:16px; font-weight:bold;">Get Started</center>
            </v:roundrect>
          <![endif]-->
          <a href="#" style="background-color:#ffffff; color:#F59E0B; display:inline-block; font-family:Arial, sans-serif; font-size:16px; font-weight:bold; line-height:44px; text-align:center; text-decoration:none; border-radius:6px; padding:0 24px; mso-hide:all;">Get Started</a>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>`,
    category: 'Buttons',
  },
];

// Additional blocks - continuing from SPECIAL / ECOMMERCE
export const ECOMMERCE_BLOCKS: BlockDefinition[] = [
  {
    id: 'product-grid-2x2',
    label: 'Product Grid 2x2',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:0 12px; font-size:0;">
      <!--[if mso]><table role="presentation" width="600"><tr><td width="300" valign="top"><![endif]-->
      <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
        <table role="presentation" width="100%"><tr><td style="padding:12px; border:1px solid #E5E7EB;">
          <img src="https://placehold.co/600x400/F59E0B/FFFFFF?text=Product+1" alt="" width="560" style="width:100%; max-width:560px; height:auto; display:block;" />
          <h3 style="margin:12px 0 4px 0; font: bold 18px Arial,sans-serif; color:#111827;">Product 1</h3>
          <p style="margin:0 0 8px 0; font: 14px Arial,sans-serif; color:#6B7280;">Short description</p>
          <p style="margin:0 0 12px 0; font: bold 18px Arial,sans-serif; color:#F59E0B;">$99</p>
          <a href="#" style="display:inline-block; background:#F59E0B; color:#fff; text-decoration:none; font: bold 14px Arial,sans-serif; border-radius:6px; line-height:36px; padding:0 16px;">Buy Now</a>
        </td></tr></table>
      </div>
      <!--[if mso]></td><td width="300" valign="top"><![endif]-->
      <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
        <table role="presentation" width="100%"><tr><td style="padding:12px; border:1px solid #E5E7EB;">
          <img src="https://placehold.co/600x400/FBBF24/111?text=Product+2" alt="" width="560" style="width:100%; max-width:560px; height:auto; display:block;" />
          <h3 style="margin:12px 0 4px 0; font: bold 18px Arial,sans-serif; color:#111827;">Product 2</h3>
          <p style="margin:0 0 8px 0; font: 14px Arial,sans-serif; color:#6B7280;">Short description</p>
          <p style="margin:0 0 12px 0; font: bold 18px Arial,sans-serif; color:#F59E0B;">$79</p>
          <a href="#" style="display:inline-block; background:#F59E0B; color:#fff; text-decoration:none; font: bold 14px Arial,sans-serif; border-radius:6px; line-height:36px; padding:0 16px;">Buy Now</a>
        </td></tr></table>
      </div>
      <!--[if mso]></td></tr><tr><td width="300" valign="top"><![endif]-->
      <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
        <table role="presentation" width="100%"><tr><td style="padding:12px; border:1px solid #E5E7EB;">
          <img src="https://placehold.co/600x400/D97706/FFFFFF?text=Product+3" alt="" width="560" style="width:100%; max-width:560px; height:auto; display:block;" />
          <h3 style="margin:12px 0 4px 0; font: bold 18px Arial,sans-serif; color:#111827;">Product 3</h3>
          <p style="margin:0 0 8px 0; font: 14px Arial,sans-serif; color:#6B7280;">Short description</p>
          <p style="margin:0 0 12px 0; font: bold 18px Arial,sans-serif; color:#F59E0B;">$59</p>
          <a href="#" style="display:inline-block; background:#F59E0B; color:#fff; text-decoration:none; font: bold 14px Arial,sans-serif; border-radius:6px; line-height:36px; padding:0 16px;">Buy Now</a>
        </td></tr></table>
      </div>
      <!--[if mso]></td><td width="300" valign="top"><![endif]-->
      <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
        <table role="presentation" width="100%"><tr><td style="padding:12px; border:1px solid #E5E7EB;">
          <img src="https://placehold.co/600x400/92400E/FFFFFF?text=Product+4" alt="" width="560" style="width:100%; max-width:560px; height:auto; display:block;" />
          <h3 style="margin:12px 0 4px 0; font: bold 18px Arial,sans-serif; color:#111827;">Product 4</h3>
          <p style="margin:0 0 8px 0; font: 14px Arial,sans-serif; color:#6B7280;">Short description</p>
          <p style="margin:0 0 12px 0; font: bold 18px Arial,sans-serif; color:#F59E0B;">$89</p>
          <a href="#" style="display:inline-block; background:#F59E0B; color:#fff; text-decoration:none; font: bold 14px Arial,sans-serif; border-radius:6px; line-height:36px; padding:0 16px;">Buy Now</a>
        </td></tr></table>
      </div>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>`,
    category: 'Special',
  },
  
  {
    id: 'order-summary',
    label: 'Order Summary',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18v14H3z"/></svg>',
    content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:0 20px;">
      <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
      <table role="presentation" width="100%" style="max-width:600px; border:1px solid #E5E7EB;">
        <tr><td style="padding:16px 20px; font: bold 18px Arial,sans-serif; color:#111827;">Order Summary</td></tr>
        <tr><td style="padding:0 20px 16px 20px;">
          <table role="presentation" width="100%">
            <tr>
              <td style="padding:8px 0; font:14px Arial,sans-serif; color:#374151;">Item A</td>
              <td align="right" style="padding:8px 0; font:14px Arial,sans-serif; color:#374151;">$49.00</td>
            </tr>
            <tr>
              <td style="padding:8px 0; font:14px Arial,sans-serif; color:#374151;">Item B</td>
              <td align="right" style="padding:8px 0; font:14px Arial,sans-serif; color:#374151;">$29.00</td>
            </tr>
            <tr>
              <td style="padding:8px 0; font:14px Arial,sans-serif; color:#374151;">Shipping</td>
              <td align="right" style="padding:8px 0; font:14px Arial,sans-serif; color:#374151;">$0.00</td>
            </tr>
            <tr>
              <td style="border-top:1px solid #E5E7EB; padding:12px 0; font: bold 16px Arial,sans-serif; color:#111827;">Total</td>
              <td align="right" style="border-top:1px solid #E5E7EB; padding:12px 0; font: bold 16px Arial,sans-serif; color:#111827;">$78.00</td>
            </tr>
          </table>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>`,
    category: 'Special',
  },
  
  {
    id: 'coupon-box',
    label: 'Coupon Box',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 7h20v10H2z"/></svg>',
    content: `
  <table role="presentation" width="100%"><tr><td align="center" style="padding:20px;">
    <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
    <table role="presentation" width="100%" style="max-width:600px; background:#FEF3C7; border:1px dashed #F59E0B;">
      <tr><td align="center" style="padding:16px 20px;">
        <p style="margin:0 0 8px 0; font: bold 18px Arial,sans-serif; color:#92400E;">Limited Time Coupon</p>
        <p style="margin:0; font: 16px Arial,sans-serif; color:#78350F;">Use code <span style="font-weight:bold; letter-spacing:1px;">SAVE20</span> at checkout</p>
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr></table>`,
    category: 'Special',
  },

  {
    id: 'signature-block',
    label: 'Signature',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4z"/></svg>',
    content: `
  <table role="presentation" width="100%">
    <tr><td align="left" style="padding:20px; font:14px/1.7 Arial,sans-serif; color:#374151;">
      <p style="margin:0 0 8px 0;">Best regards,</p>
      <p style="margin:0 0 8px 0; font-weight:bold; color:#111827;">{{sender_name}}</p>
      <p style="margin:0;">{{sender_title}} · {{company_name}}</p>
    </td></tr>
  </table>`,
    category: 'Special',
  },

  {
    id: 'rating-row',
    label: 'Star Rating Row',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27 18.18 21"/></svg>',
    content: `
  <table role="presentation" width="100%"><tr><td align="center" style="padding:12px 20px;">
    <span style="font-size:20px; color:#F59E0B;">★ ★ ★ ★ ☆</span>
    <p style="margin:8px 0 0 0; font:14px Arial,sans-serif; color:#374151;">4.0/5 based on 128 reviews</p>
  </td></tr></table>`,
    category: 'Special',
  },

  {
    id: 'free-shipping-banner',
    label: 'Free Shipping Banner',
    media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 7h20v10H2z"/></svg>',
    content: `
  <table role="presentation" width="100%" style="background:#ECFDF5;">
    <tr><td align="center" style="padding:12px 20px;">
      <p style="margin:0; font:14px Arial,sans-serif; color:#065F46;">Free shipping on orders over $50 · Use code <span style="font-weight:bold;">FREESHIP</span></p>
    </td></tr>
  </table>`,
    category: 'Special',
  },
];

// Combine all blocks
export const ALL_EMAIL_BLOCKS = [...EMAIL_BLOCKS, ...ECOMMERCE_BLOCKS];
