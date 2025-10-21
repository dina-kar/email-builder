import { Component, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import grapesjs from 'grapesjs';

declare global {
  interface Window {
    editor: any;
  }
}

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-editor.component.html',
  styleUrls: ['./email-editor.component.css']
})
export class EmailEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private editor: any;
  protected searchTerm = signal('');

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private initializeEditor(): void {
    this.editor = grapesjs.init({
      container: '#gjs',
      height: '100%',
      width: '100%',
      fromElement: false,
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 3,
      },
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '',
          },
          {
            id: 'tablet',
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            id: 'mobile',
            name: 'Mobile',
            width: '375px',
            widthMedia: '768px',
          },
        ],
      },
      panels: {
        defaults: [],
      },
      blockManager: {
        appendTo: '#blocks-container',
        blocks: [
          // ========== STRUCTURE BLOCKS ==========
            {
              id: 'email-container',
              label: 'Email Container',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Zm2-14h16v12H4V6Z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px;">
                      <tr><td style="padding: 40px 30px; text-align: center;"></td></tr>
                    </table>
                  </td>
                </tr>
              </table>`,
              category: 'Structure',
            },
            {
              id: '1-column',
              label: '1 Column',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v18H3V3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding: 20px;">Single column content</td></tr>
              </table>`,
              category: 'Structure',
            },
            {
              id: '2-columns',
              label: '2 Columns',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v18H3V3zm10 0h8v18h-8V3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="padding: 20px; vertical-align: top;">Column 1</td>
                  <td width="50%" style="padding: 20px; vertical-align: top;">Column 2</td>
                </tr>
              </table>`,
              category: 'Structure',
            },
            {
              id: '3-columns',
              label: '3 Columns',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h5v18H3V3zm7 0h4v18h-4V3zm6 0h5v18h-5V3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.33%" style="padding: 15px; vertical-align: top;">Column 1</td>
                  <td width="33.33%" style="padding: 15px; vertical-align: top;">Column 2</td>
                  <td width="33.33%" style="padding: 15px; vertical-align: top;">Column 3</td>
                </tr>
              </table>`,
              category: 'Structure',
            },
            {
              id: '4-columns',
              label: '4 Columns',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h3.5v18H3V3zm5 0h3.5v18H8V3zm5 0h3.5v18H13V3zm5 0h3.5v18H18V3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="25%" style="padding: 10px; vertical-align: top;">Col 1</td>
                  <td width="25%" style="padding: 10px; vertical-align: top;">Col 2</td>
                  <td width="25%" style="padding: 10px; vertical-align: top;">Col 3</td>
                  <td width="25%" style="padding: 10px; vertical-align: top;">Col 4</td>
                </tr>
              </table>`,
              category: 'Structure',
            },
            {
              id: 'sidebar-layout',
              label: 'Sidebar Layout',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h6v18H3V3zm8 0h10v18H11V3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="30%" style="padding: 20px; vertical-align: top; background-color: #f9f9f9;">Sidebar</td>
                  <td width="70%" style="padding: 20px; vertical-align: top;">Main Content</td>
                </tr>
              </table>`,
              category: 'Structure',
            },
            
            // ========== HEADER BLOCKS ==========
            {
              id: 'header-logo',
              label: 'Header Logo',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 30px 20px;">
                <tr>
                  <td align="center">
                    <img src="https://placehold.co/200x60/F59E0B/FFFFFF?text=Your+Logo" alt="Logo" style="max-width: 200px; height: auto; display: block;" />
                  </td>
                </tr>
              </table>`,
              category: 'Headers',
            },
            {
              id: 'header-with-nav',
              label: 'Header + Nav',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h18v4H3v-4z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px;">
                <tr>
                  <td width="200" style="vertical-align: middle;">
                    <img src="https://placehold.co/150x50/F59E0B/FFFFFF?text=Logo" alt="Logo" style="max-width: 150px; height: auto;" />
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="#" style="color: #374151; text-decoration: none; padding: 0 15px; font-size: 14px;">Home</a>
                    <a href="#" style="color: #374151; text-decoration: none; padding: 0 15px; font-size: 14px;">About</a>
                    <a href="#" style="color: #374151; text-decoration: none; padding: 0 15px; font-size: 14px;">Contact</a>
                  </td>
                </tr>
              </table>`,
              category: 'Headers',
            },
            {
              id: 'hero-header',
              label: 'Hero Header',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v8h18V3zm0 10H3v8h18v-8z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 60px 20px;">
                <tr>
                  <td align="center" style="color: #ffffff;">
                    <h1 style="margin: 0 0 15px 0; font-size: 36px; font-weight: bold; color: #ffffff;">Welcome!</h1>
                    <p style="margin: 0; font-size: 18px; color: #ffffff; line-height: 1.6;">Discover amazing products and exclusive offers</p>
                  </td>
                </tr>
              </table>`,
              category: 'Headers',
            },
            
            // ========== CONTENT BLOCKS ==========
            {
              id: 'text-block',
              label: 'Text',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.6 14h4.8l1 3h2l-4.2-12h-2.2L6.8 17h2l1-3ZM12 7.8 13.9 13h-3.8L12 7.8Z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #374151;">
                    <p style="margin: 0;">Insert your text content here. You can edit this text and style it however you want.</p>
                  </td>
                </tr>
              </table>`,
              category: 'Content',
            },
            {
              id: 'heading',
              label: 'Heading',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 4h3v7h8V4h3v16h-3v-7H8v7H5V4z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #111827;">Your Heading Here</h2>
                  </td>
                </tr>
              </table>`,
              category: 'Content',
            },
            {
              id: 'paragraph',
              label: 'Paragraph',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.8; color: #374151;">
                    <p style="margin: 0 0 15px 0;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                    <p style="margin: 0;">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                  </td>
                </tr>
              </table>`,
              category: 'Content',
            },
            {
              id: 'list',
              label: 'List',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.8; color: #374151;">
                    <ul style="margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 10px;">First list item</li>
                      <li style="margin-bottom: 10px;">Second list item</li>
                      <li style="margin-bottom: 10px;">Third list item</li>
                    </ul>
                  </td>
                </tr>
              </table>`,
              category: 'Content',
            },
            
            // ========== MEDIA BLOCKS ==========
            {
              id: 'image',
              label: 'Image',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <img src="https://placehold.co/600x350/F59E0B/FFFFFF?text=Your+Image" alt="Image" style="max-width: 100%; height: auto; display: block;" />
                  </td>
                </tr>
              </table>`,
              category: 'Media',
            },
            {
              id: 'image-text',
              label: 'Image + Text',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="padding: 20px; vertical-align: top;">
                    <img src="https://placehold.co/280x200/F59E0B/FFFFFF?text=Image" alt="Image" style="max-width: 100%; height: auto; display: block;" />
                  </td>
                  <td width="50%" style="padding: 20px; vertical-align: top;">
                    <h3 style="margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 22px; color: #111827;">Feature Title</h3>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #374151;">Description of your feature or product goes here. Make it compelling and engaging.</p>
                  </td>
                </tr>
              </table>`,
              category: 'Media',
            },
            {
              id: 'image-gallery',
              label: 'Image Gallery',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.33%" style="padding: 10px;">
                    <img src="https://placehold.co/180x180/F59E0B/FFFFFF?text=1" alt="Gallery 1" style="width: 100%; height: auto; display: block;" />
                  </td>
                  <td width="33.33%" style="padding: 10px;">
                    <img src="https://placehold.co/180x180/FBBF24/FFFFFF?text=2" alt="Gallery 2" style="width: 100%; height: auto; display: block;" />
                  </td>
                  <td width="33.33%" style="padding: 10px;">
                    <img src="https://placehold.co/180x180/D97706/FFFFFF?text=3" alt="Gallery 3" style="width: 100%; height: auto; display: block;" />
                  </td>
                </tr>
              </table>`,
              category: 'Media',
            },
            {
              id: 'video',
              label: 'Video',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
                      <img src="https://placehold.co/600x340/F59E0B/FFFFFF?text=▶+Play+Video" alt="Video Thumbnail" style="max-width: 100%; height: auto; display: block;" />
                    </a>
                  </td>
                </tr>
              </table>`,
              category: 'Media',
            },
            
            // ========== BUTTON BLOCKS ==========
            {
              id: 'button',
              label: 'Button',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V5h14v14z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Click Here</a>
                  </td>
                </tr>
              </table>`,
              category: 'Buttons',
            },
            {
              id: 'button-group',
              label: 'Button Group',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h6v14H3V5zm8 0h10v14H11V5z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <a href="#" style="display: inline-block; padding: 14px 28px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin: 0 8px;">Primary</a>
                    <a href="#" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #374151; text-decoration: none; border-radius: 6px; border: 2px solid #E5E7EB; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin: 0 8px;">Secondary</a>
                  </td>
                </tr>
              </table>`,
              category: 'Buttons',
            },
            {
              id: 'cta-banner',
              label: 'CTA Banner',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v18h18V3zm-2 16H5V5h14v14z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F59E0B; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <h2 style="margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #ffffff;">Special Offer!</h2>
                    <p style="margin: 0 0 25px 0; font-family: Arial, sans-serif; font-size: 16px; color: #ffffff;">Don't miss out on this limited-time opportunity</p>
                    <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #F59E0B; text-decoration: none; border-radius: 6px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Get Started</a>
                  </td>
                </tr>
              </table>`,
              category: 'Buttons',
            },
            
            // ========== SOCIAL MEDIA ==========
            {
              id: 'social-icons',
              label: 'Social Icons',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 30px 20px;">
                    <a href="#" style="display: inline-block; margin: 0 8px;">
                      <img src="https://placehold.co/40x40/3b5998/FFFFFF?text=f" alt="Facebook" width="40" height="40" style="display: block; border-radius: 50%;" />
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 8px;">
                      <img src="https://placehold.co/40x40/1DA1F2/FFFFFF?text=T" alt="Twitter" width="40" height="40" style="display: block; border-radius: 50%;" />
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 8px;">
                      <img src="https://placehold.co/40x40/E4405F/FFFFFF?text=IG" alt="Instagram" width="40" height="40" style="display: block; border-radius: 50%;" />
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 8px;">
                      <img src="https://placehold.co/40x40/0077B5/FFFFFF?text=in" alt="LinkedIn" width="40" height="40" style="display: block; border-radius: 50%;" />
                    </a>
                  </td>
                </tr>
              </table>`,
              category: 'Social',
            },
            {
              id: 'social-share',
              label: 'Social Share',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v18h18V3zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; padding: 30px 20px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 16px; color: #374151;">Share this with your friends</p>
                    <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #3b5998; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; margin: 5px;">Facebook</a>
                    <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #1DA1F2; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; margin: 5px;">Twitter</a>
                    <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #0077B5; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; margin: 5px;">LinkedIn</a>
                  </td>
                </tr>
              </table>`,
              category: 'Social',
            },
            
            // ========== FOOTER BLOCKS ==========
            {
              id: 'footer-simple',
              label: 'Simple Footer',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Zm2-14h16v12H4V6Z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #111827; padding: 30px 20px;">
                <tr>
                  <td align="center" style="font-family: Arial, sans-serif; font-size: 14px; color: #9CA3AF; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;">&copy; 2025 Your Company. All rights reserved.</p>
                    <p style="margin: 0;">
                      <a href="#" style="color: #F59E0B; text-decoration: none; margin: 0 8px;">Unsubscribe</a> | 
                      <a href="#" style="color: #F59E0B; text-decoration: none; margin: 0 8px;">Privacy Policy</a> | 
                      <a href="#" style="color: #F59E0B; text-decoration: none; margin: 0 8px;">Terms</a>
                    </p>
                  </td>
                </tr>
              </table>`,
              category: 'Footers',
            },
            {
              id: 'footer-detailed',
              label: 'Detailed Footer',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v8H3V3zm0 10h18v8H3v-8z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1F2937; padding: 40px 20px;">
                <tr>
                  <td width="33.33%" style="padding: 15px; vertical-align: top; font-family: Arial, sans-serif; color: #D1D5DB;">
                    <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #F59E0B;">About Us</h4>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6;">Your company description goes here. Brief and engaging.</p>
                  </td>
                  <td width="33.33%" style="padding: 15px; vertical-align: top; font-family: Arial, sans-serif; color: #D1D5DB;">
                    <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #F59E0B;">Quick Links</h4>
                    <p style="margin: 0 0 8px 0;"><a href="#" style="color: #D1D5DB; text-decoration: none; font-size: 14px;">Home</a></p>
                    <p style="margin: 0 0 8px 0;"><a href="#" style="color: #D1D5DB; text-decoration: none; font-size: 14px;">Products</a></p>
                    <p style="margin: 0 0 8px 0;"><a href="#" style="color: #D1D5DB; text-decoration: none; font-size: 14px;">Contact</a></p>
                  </td>
                  <td width="33.33%" style="padding: 15px; vertical-align: top; font-family: Arial, sans-serif; color: #D1D5DB;">
                    <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #F59E0B;">Contact</h4>
                    <p style="margin: 0 0 8px 0; font-size: 14px;">support@company.com</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;">+1 (555) 123-4567</p>
                    <p style="margin: 0; font-size: 14px;">123 Main St, City, Country</p>
                  </td>
                </tr>
              </table>`,
              category: 'Footers',
            },
            
            // ========== DIVIDERS & SPACERS ==========
            {
              id: 'divider',
              label: 'Divider',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11h18v2H3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 0;" />
                  </td>
                </tr>
              </table>`,
              category: 'Decorations',
            },
            {
              id: 'spacer',
              label: 'Spacer',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height: 40px; line-height: 40px; font-size: 0;">&nbsp;</td>
                </tr>
              </table>`,
              category: 'Decorations',
            },
            {
              id: 'dotted-divider',
              label: 'Dotted Divider',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <hr style="border: none; border-top: 2px dotted #E5E7EB; margin: 0;" />
                  </td>
                </tr>
              </table>`,
              category: 'Decorations',
            },
            
            // ========== SPECIAL COMPONENTS ==========
            {
              id: 'testimonial',
              label: 'Testimonial',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; padding: 40px 30px;">
                <tr>
                  <td align="center">
                    <img src="https://placehold.co/80x80/F59E0B/FFFFFF?text=JS" alt="Customer" width="80" height="80" style="border-radius: 50%; display: block; margin: 0 auto 20px;" />
                    <p style="margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 18px; font-style: italic; color: #374151; line-height: 1.6;">"This product changed my life! Highly recommended to anyone looking for quality."</p>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #111827;">John Smith</p>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; color: #6B7280;">CEO, Company Inc.</p>
                  </td>
                </tr>
              </table>`,
              category: 'Special',
            },
            {
              id: 'pricing-card',
              label: 'Pricing Card',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 2px solid #E5E7EB; border-radius: 8px; padding: 30px; margin: 20px auto; max-width: 400px;">
                <tr>
                  <td align="center">
                    <h3 style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #111827;">Pro Plan</h3>
                    <p style="margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 48px; font-weight: bold; color: #F59E0B;"><sup style="font-size: 24px;">$</sup>49<sub style="font-size: 16px; font-weight: normal; color: #6B7280;">/month</sub></p>
                    <ul style="text-align: left; margin: 0 0 25px 0; padding-left: 20px; font-family: Arial, sans-serif; font-size: 16px; color: #374151; line-height: 2;">
                      <li>Unlimited access</li>
                      <li>Premium support</li>
                      <li>Advanced features</li>
                      <li>Monthly updates</li>
                    </ul>
                    <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Get Started</a>
                  </td>
                </tr>
              </table>`,
              category: 'Special',
            },
            {
              id: 'countdown',
              label: 'Countdown Timer',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 18px; color: #ffffff;">Offer Ends In</p>
                    <table cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td align="center" style="padding: 0 10px;">
                          <div style="background-color: #ffffff; border-radius: 8px; padding: 15px 20px; min-width: 60px;">
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #F59E0B;">03</p>
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">DAYS</p>
                          </div>
                        </td>
                        <td align="center" style="padding: 0 10px;">
                          <div style="background-color: #ffffff; border-radius: 8px; padding: 15px 20px; min-width: 60px;">
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #F59E0B;">12</p>
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">HOURS</p>
                          </div>
                        </td>
                        <td align="center" style="padding: 0 10px;">
                          <div style="background-color: #ffffff; border-radius: 8px; padding: 15px 20px; min-width: 60px;">
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #F59E0B;">45</p>
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">MINS</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>`,
              category: 'Special',
            },
            {
              id: 'product-card',
              label: 'Product Card',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; max-width: 300px; margin: 20px auto;">
                <tr>
                  <td>
                    <img src="https://placehold.co/300x200/F59E0B/FFFFFF?text=Product" alt="Product" style="width: 100%; height: auto; display: block;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #111827;">Product Name</h3>
                    <p style="margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 14px; color: #6B7280; line-height: 1.6;">Brief product description goes here. Make it appealing!</p>
                    <p style="margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #F59E0B;">$99.99</p>
                    <a href="#" style="display: block; text-align: center; padding: 12px 24px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">Buy Now</a>
                  </td>
                </tr>
              </table>`,
              category: 'Special',
            },
            {
              id: 'alert-box',
              label: 'Alert Box',
              media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
              content: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 20px;">
                    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px 20px; border-radius: 4px;">
                      <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #92400E;">⚠️ Important Notice</p>
                      <p style="margin: 10px 0 0 0; font-family: Arial, sans-serif; font-size: 14px; color: #78350F; line-height: 1.6;">This is an important message or notification for your readers.</p>
                    </div>
                  </td>
                </tr>
              </table>`,
              category: 'Special',
            },
        ],
      },
      layerManager: {
        appendTo: '#layers-container',
      },
      selectorManager: {
        appendTo: '#styles-container',
      },
      styleManager: {
        appendTo: '#styles-container',
        sectors: [
          {
            name: 'General',
            open: true,
            properties: [
              {
                type: 'stack',
                property: 'background',
                properties: [
                  { name: 'Color', property: 'background-color' },
                  { name: 'Image', property: 'background-image' },
                ],
              },
              'display',
              'opacity',
              'cursor',
            ],
          },
          {
            name: 'Dimension',
            open: false,
            properties: [
              'width',
              'height',
              'max-width',
              'min-height',
              'margin',
              'padding',
            ],
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              'text-align',
              'text-decoration',
              'text-shadow',
            ],
          },
          {
            name: 'Decorations',
            open: false,
            properties: [
              'border-radius',
              'border',
              'box-shadow',
            ],
          },
          {
            name: 'Flex',
            open: false,
            properties: [
              'flex-direction',
              'flex-wrap',
              'justify-content',
              'align-items',
              'align-content',
              'order',
              'flex-basis',
              'flex-grow',
              'flex-shrink',
              'align-self',
            ],
          },
        ],
      },
      traitManager: {
        appendTo: '#traits-container',
      },
      canvas: {
        styles: [],
        scripts: [],
      },
      pluginsOpts: {},
    });

    // Add custom commands
    this.addCustomCommands();

    // Log editor for debugging
    console.log('GrapesJS Editor initialized:', this.editor);
    window.editor = this.editor;
  }

  private addCustomCommands(): void {
    // Device commands
    this.editor.Commands.add('set-device-desktop', {
      run: (editor: any) => editor.setDevice('Desktop'),
    });
    this.editor.Commands.add('set-device-tablet', {
      run: (editor: any) => editor.setDevice('Tablet'),
    });
    this.editor.Commands.add('set-device-mobile', {
      run: (editor: any) => editor.setDevice('Mobile'),
    });

    // Save command
    this.editor.Commands.add('save-db', {
      run: (editor: any) => {
        editor.store();
        alert('✅ Design saved successfully!');
      },
    });

    // Import template command
    this.editor.Commands.add('import-template', {
      run: (editor: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
              const htmlContent = event.target.result;
              
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              
              const bodyContent = doc.body.innerHTML;
              const styleContent = doc.querySelector('style')?.textContent || '';
              
              editor.setComponents(bodyContent);
              editor.setStyle(styleContent);
              
              alert('✅ Template imported successfully!');
            };
            reader.readAsText(file);
          }
        };
        input.click();
      },
    });

    // Clear canvas command
    this.editor.Commands.add('clear-canvas', {
      run: (editor: any) => {
        if (confirm('⚠️ Are you sure you want to clear the canvas? This cannot be undone.')) {
          editor.setComponents('');
          editor.setStyle('');
        }
      },
    });

    // Export template command
    this.editor.Commands.add('export-template', {
      run: (editor: any) => {
        const html = editor.getHtml();
        const css = editor.getCss();
        
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Template</title>
  <style>${css}</style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  ${html}
</body>
</html>`;
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'email-template-' + Date.now() + '.html';
        link.click();
        URL.revokeObjectURL(url);
        
        alert('✅ Email template exported successfully!');
      },
    });
  }

  private setupEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName + '-tab')?.classList.add('active');
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.editor.runCommand('save-db');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.editor.runCommand('core:undo');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        this.editor.runCommand('core:redo');
      }
    });
  }

  // Methods for toolbar actions
  protected undo(): void {
    this.editor.runCommand('core:undo');
  }

  protected redo(): void {
    this.editor.runCommand('core:redo');
  }

  protected setDeviceDesktop(): void {
    this.editor.runCommand('set-device-desktop');
  }

  protected setDeviceTablet(): void {
    this.editor.runCommand('set-device-tablet');
  }

  protected setDeviceMobile(): void {
    this.editor.runCommand('set-device-mobile');
  }

  protected save(): void {
    this.editor.runCommand('save-db');
  }

  protected importTemplate(): void {
    this.editor.runCommand('import-template');
  }

  protected exportTemplate(): void {
    this.editor.runCommand('export-template');
  }

  protected clearCanvas(): void {
    this.editor.runCommand('clear-canvas');
  }

  protected preview(): void {
    this.editor.runCommand('preview');
  }

  protected fullscreen(): void {
    this.editor.runCommand('fullscreen');
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    this.searchTerm.set(searchTerm);
    this.performSearch(searchTerm);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
    const input = document.getElementById('block-search') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
    this.performSearch('');
  }

  private performSearch(searchTerm: string): void {
    const blocks = document.querySelectorAll('.gjs-block');
    const categories = document.querySelectorAll('.gjs-block-category');
    let visibleCount = 0;
    
    blocks.forEach(block => {
      const label = (block.querySelector('.gjs-block-label') as HTMLElement)?.textContent?.toLowerCase() || '';
      if (label.includes(searchTerm)) {
        (block as HTMLElement).style.display = 'flex';
        visibleCount++;
      } else {
        (block as HTMLElement).style.display = 'none';
      }
    });
    
    categories.forEach(category => {
      const categoryBlocks = category.querySelectorAll('.gjs-block');
      const hasVisibleBlocks = Array.from(categoryBlocks).some(
        block => (block as HTMLElement).style.display !== 'none'
      );
      (category as HTMLElement).style.display = hasVisibleBlocks || searchTerm === '' ? 'block' : 'none';
    });
    
    const searchInput = document.getElementById('block-search') as HTMLInputElement;
    if (searchInput) {
      if (searchTerm) {
        searchInput.placeholder = `Found ${visibleCount} block${visibleCount !== 1 ? 's' : ''}`;
      } else {
        searchInput.placeholder = 'Search blocks...';
      }
    }
  }
}
