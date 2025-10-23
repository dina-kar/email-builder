import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import grapesjs from 'grapesjs';
import juice from 'juice';
import { TemplateService, Template } from '../services/template.service';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    editor: any;
  }
}

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-editor.component.html',
  styleUrls: ['./email-editor.component.css']
})
export class EmailEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  private editor: any;
  private autoSaveInterval: any;
  private templateId: string | null = null;
  
  protected searchTerm = signal('');
  protected templateName = signal('Untitled Template');
  protected isSaving = signal(false);
  protected lastSaved = signal<Date | null>(null);
  protected showSaveDialog = signal(false);

  ngOnInit(): void {
    // Get template ID from route params if editing
    this.route.params.subscribe(params => {
      this.templateId = params['id'] || null;
    });
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
    this.setupEventListeners();
    
    // Load template if editing existing one
    if (this.templateId) {
      this.loadTemplate(this.templateId);
    }
    
    // Setup auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.templateId && !this.isSaving()) {
        this.autoSaveTemplate();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  private loadTemplate(id: string): void {
    this.templateService.getTemplate(id).subscribe({
      next: (template: Template) => {
        this.templateName.set(template.name);
        
        // Load template content into editor
        if (template.components) {
          this.editor.setComponents(template.components);
        } else if (template.html) {
          this.editor.setComponents(template.html);
        }
        
        if (template.styles) {
          this.editor.setStyle(template.styles);
        } else if (template.css) {
          this.editor.setStyle(template.css);
        }
        
        this.lastSaved.set(new Date(template.updatedAt));
      },
      error: (err) => {
        console.error('Error loading template:', err);
        alert(`Failed to load template: ${err.message}`);
        this.router.navigate(['/']);
      }
    });
  }

  private autoSaveTemplate(): void {
    if (!this.templateId) return;
    
    const updateData = {
      html: this.editor.getHtml(),
      css: this.editor.getCss(),
      components: JSON.parse(JSON.stringify(this.editor.getComponents())),
      styles: JSON.parse(JSON.stringify(this.editor.getStyle()))
    };
    
    this.templateService.updateTemplate(this.templateId, updateData).subscribe({
      next: () => {
        this.lastSaved.set(new Date());
      },
      error: (err) => {
        console.error('Auto-save failed:', err);
      }
    });
  }

  private initializeEditor(): void {
    this.editor = grapesjs.init({
      container: '#gjs',
      height: '100%',
      width: '100%',
      fromElement: false,
      storageManager: {
        type: 'remote',
        autosave: false, // We'll handle saving manually
        autoload: false, // We'll load templates from backend
        stepsBeforeSave: 0,
        options: {
          remote: {
            urlStore: `${environment.apiUrl}/templates`,
            urlLoad: `${environment.apiUrl}/templates`,
            onStore: (data: any, editor: any) => {
              // This will be handled by our save methods
              return {};
            },
            onLoad: (result: any) => {
              // This will be handled by loadTemplate
              return result;
            },
          },
        },
      },
      assetManager: {
        upload: `${environment.apiUrl}/templates/upload/asset`,
        uploadName: 'file',
        multiUpload: false,
        autoAdd: true,
        dropzone: true,
        dropzoneContent: '<div style="text-align:center; padding:40px; color:#666;">Drop files here or click to upload</div>',
        headers: {
          // Add any auth headers if needed
        },
        params: {
          // Additional params if needed
        },
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
            id: '1-column',
            label: '1 Column',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v18H3V3z"/></svg>',
            content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 20px;">
        <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr><td style="padding:20px;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif; line-height:1.6;">This is a single column layout.</p>
          </td></tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>`,
            category: 'Structure',
          },
          {
            id: '2-columns',
            label: '2 Columns',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v18H3V3zm10 0h8v18h-8V3z"/></svg>',
            content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 20px; font-size:0;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
          <tr><td width="300" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:20px; vertical-align:top;">
              <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif; line-height:1.6;">Column 1</p>
            </td></tr>
          </table>
        </div>
        <!--[if mso]></td><td width="300" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:20px; vertical-align:top;">
              <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif; line-height:1.6;">Column 2</p>
            </td></tr>
          </table>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>`,
            category: 'Structure',
          },
          {
            id: '3-columns',
            label: '3 Columns',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h5v18H3V3zm7 0h4v18h-4V3zm6 0h5v18h-5V3z"/></svg>',
            content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 16px; font-size:0;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="200" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:200px;">
          <table role="presentation" width="100%"><tr><td style="padding:15px;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif;">Column 1</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="200" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:200px;">
          <table role="presentation" width="100%"><tr><td style="padding:15px;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif;">Column 2</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="200" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:200px;">
          <table role="presentation" width="100%"><tr><td style="padding:15px;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif;">Column 3</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>`,
            category: 'Structure',
          },
          {
            id: '4-columns',
            label: '4 Columns',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h3.5v18H3V3zm5 0h3.5v18H8V3zm5 0h3.5v18H13V3zm5 0h3.5v18H18V3z"/></svg>',
            content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 12px; font-size:0;">
        <!--[if mso]><table role="presentation" width="600"><tr>
          <td width="150" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:150px;">
          <table role="presentation" width="100%"><tr><td style="padding:10px;"><p style="margin:0; font-size:16px; color:#374151; font-family:Arial,sans-serif;">Col 1</p></td></tr></table>
        </div>
        <!--[if mso]></td><td width="150" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:150px;">
          <table role="presentation" width="100%"><tr><td style="padding:10px;"><p style="margin:0; font-size:16px; color:#374151; font-family:Arial,sans-serif;">Col 2</p></td></tr></table>
        </div>
        <!--[if mso]></td><td width="150" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:150px;">
          <table role="presentation" width="100%"><tr><td style="padding:10px;"><p style="margin:0; font-size:16px; color:#374151; font-family:Arial,sans-serif;">Col 3</p></td></tr></table>
        </div>
        <!--[if mso]></td><td width="150" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:150px;">
          <table role="presentation" width="100%"><tr><td style="padding:10px;"><p style="margin:0; font-size:16px; color:#374151; font-family:Arial,sans-serif;">Col 4</p></td></tr></table>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
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
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:180px;">
          <table role="presentation" width="100%"><tr><td style="padding:20px; background-color:#f9f9f9;">
            <p style="margin:0; font-size:16px; color:#374151; font-family:Arial, sans-serif;">Sidebar</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="420" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:420px;">
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
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
          <table role="presentation" width="100%"><tr><td style="padding:20px;">
            <img src="https://placehold.co/600x400/F59E0B/FFFFFF?text=Image" alt="Image" width="560" style="width:100%; max-width:560px; height:auto; display:block;" />
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="300" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:300px;">
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
          <!-- Reuse bulletproof button inline for consistency -->
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

          // ========== SPECIAL / ECOMMERCE EXTRAS ==========
          {
            id: 'product-grid-2x2',
            label: 'Product Grid 2x2',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>',
            content: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:0 12px; font-size:0;">
      <!-- row 1 -->
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
      <!-- row 2 -->
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
          // ========== FOOTERS ==========
          {
            id: 'footer-simple',
            label: 'Simple Footer',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Z"/></svg>',
            content: `
  <table role="presentation" width="100%" style="background-color:#111827;">
    <tr><td align="center" style="padding:24px 20px;">
      <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
      <table role="presentation" width="100%" style="max-width:600px;">
        <tr><td align="center" style="font-family:Arial, sans-serif; font-size:14px; color:#9CA3AF; line-height:1.6;">
          <p style="margin:0 0 8px 0;">© 2025 Your Company. All rights reserved.</p>
          <p style="margin:0 0 8px 0;">
            <a href="{{view_in_browser_url}}" style="color:#F59E0B; text-decoration:none;">View in browser</a> ·
            <a href="{{unsubscribe_url}}" style="color:#F59E0B; text-decoration:none;">Unsubscribe</a> ·
            <a href="{{privacy_url}}" style="color:#F59E0B; text-decoration:none;">Privacy</a>
          </p>
          <p style="margin:0; font-size:13px; color:#9CA3AF;">
            {{company_name}}, {{address_line_1}}, {{address_line_2}}, {{city}}, {{region}} {{postal_code}}, {{country}}
          </p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>`,
            category: 'Footers',
          },
          {
            id: 'footer-detailed',
            label: 'Detailed Footer',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v8H3v8z"/></svg>',
            content: `
  <table role="presentation" width="100%" style="background-color:#1F2937;">
    <tr>
      <td align="center" style="padding:32px 20px; font-size:0;">
        <!--[if mso]><table role="presentation" width="600"><tr>
          <td width="200" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:200px;">
          <table role="presentation" width="100%"><tr><td style="padding:12px;">
            <h4 style="margin:0 0 10px 0; font: bold 16px Arial,sans-serif; color:#F59E0B;">About</h4>
            <p style="margin:0; font: 14px/1.6 Arial,sans-serif; color:#D1D5DB;">Brief description of your company or newsletter.</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="200" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:200px;">
          <table role="presentation" width="100%"><tr><td style="padding:12px;">
            <h4 style="margin:0 0 10px 0; font: bold 16px Arial,sans-serif; color:#F59E0B;">Links</h4>
            <p style="margin:0 0 8px 0;"><a href="{{home_url}}" style="color:#D1D5DB; text-decoration:none; font:14px Arial,sans-serif;">Home</a></p>
            <p style="margin:0 0 8px 0;"><a href="{{products_url}}" style="color:#D1D5DB; text-decoration:none; font:14px Arial,sans-serif;">Products</a></p>
            <p style="margin:0;"><a href="{{support_url}}" style="color:#D1D5DB; text-decoration:none; font:14px Arial,sans-serif;">Support</a></p>
          </td></tr></table>
        </div>
        <!--[if mso]></td><td width="200" valign="top"><![endif]-->
        <div style="display:inline-block; vertical-align:top; width:100%; max-width:200px;">
          <table role="presentation" width="100%"><tr><td style="padding:12px;">
            <h4 style="margin:0 0 10px 0; font: bold 16px Arial,sans-serif; color:#F59E0B;">Contact</h4>
            <p style="margin:0 0 6px 0; font:14px Arial,sans-serif; color:#D1D5DB;">{{support_email}}</p>
            <p style="margin:0 0 6px 0; font:14px Arial,sans-serif; color:#D1D5DB;">{{support_phone}}</p>
            <p style="margin:0; font:14px Arial,sans-serif; color:#D1D5DB;">{{address_line_1}}, {{city}}</p>
          </td></tr></table>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 20px 24px;">
        <p style="margin:0; font:12px Arial,sans-serif; color:#9CA3AF;">
          You received this email because you signed up at {{signup_source}}. Manage preferences or <a href="{{unsubscribe_url}}" style="color:#F59E0B; text-decoration:none;">unsubscribe</a>.
        </p>
      </td>
    </tr>
  </table>`,
            category: 'Footers',
          },
          {
            id: 'footer-legal-compact',
            label: 'Legal Footer',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2z"/></svg>',
            content: `
  <table role="presentation" width="100%" style="background:#0B1220;">
    <tr><td align="center" style="padding:16px 20px;">
      <table role="presentation" width="100%" style="max-width:600px;">
        <tr><td align="center" style="font:12px/1.6 Arial,sans-serif; color:#9CA3AF;">
          <p style="margin:0 0 6px 0;">
            {{company_name}} · {{address_line_1}}, {{city}}, {{region}} {{postal_code}}, {{country}}
          </p>
          <p style="margin:0;">
            <a href="{{unsubscribe_url}}" style="color:#F59E0B; text-decoration:none;">Unsubscribe</a> ·
            <a href="{{preferences_url}}" style="color:#F59E0B; text-decoration:none;">Manage preferences</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>`,
            category: 'Footers',
          },

          // ========== UTILITIES ==========
          {
            id: 'preheader',
            label: 'Preheader (Hidden)',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18v14H3z"/></svg>',
            content: `
  <!-- Preheader: place this immediately after <body> -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Your short, benefit‑led preview text goes here. Avoid repeating the subject.
  </div>`,
            category: 'Utilities',
          },
          {
            id: 'view-in-browser',
            label: 'View in Browser',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18v14H3z"/></svg>',
            content: `
  <table role="presentation" width="100%">
    <tr><td align="center" style="padding:8px 20px;">
      <table role="presentation" width="100%" style="max-width:600px;">
        <tr>
          <td align="right" style="font:12px Arial,sans-serif; color:#6B7280;">
            Having trouble viewing this email? <a href="{{view_in_browser_url}}" style="color:#2563EB; text-decoration:none;">View in your browser</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`,
            category: 'Utilities',
          },
          {
            id: 'divider',
            label: 'Divider',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11h18v2H3z"/></svg>',
            content: `
  <table role="presentation" width="100%"><tr><td style="padding:16px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="border-top:1px solid #E5E7EB; height:1px; line-height:1px; font-size:0;">&nbsp;</td></tr>
    </table>
  </td></tr></table>`,
            category: 'Decorations',
          },
          {
            id: 'dotted-divider',
            label: 'Dotted Divider',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11h2v2H3z"/></svg>',
            content: `
  <table role="presentation" width="100%"><tr><td style="padding:16px 0;">
    <table role="presentation" width="100%"><tr>
      <td style="border-top:2px dotted #E5E7EB; height:1px; line-height:1px; font-size:0;">&nbsp;</td>
    </tr></table>
  </td></tr></table>`,
            category: 'Decorations',
          },
          {
            id: 'spacer',
            label: 'Spacer',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 15h18v-2H3z"/></svg>',
            content: `
  <table role="presentation" width="100%"><tr>
    <td style="height:24px; line-height:24px; font-size:0;">&nbsp;</td>
  </tr></table>`,
            category: 'Decorations',
          },

          // ========== SOCIAL ==========
          {
            id: 'social-icons-touch',
            label: 'Social Icons',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77"/></svg>',
            content: `
  <table role="presentation" width="100%">
    <tr><td align="center" style="padding:20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:4px;">
            <a href="{{facebook_url}}" style="display:inline-block;">
              <img src="https://placehold.co/88x88/3b5998/FFFFFF?text=f" alt="Facebook" width="44" height="44" style="display:block; width:44px; height:44px; border-radius:50%;" />
            </a>
          </td>
          <td align="center" style="padding:4px;">
            <a href="{{twitter_url}}" style="display:inline-block;">
              <img src="https://placehold.co/88x88/1DA1F2/FFFFFF?text=T" alt="Twitter/X" width="44" height="44" style="display:block; width:44px; height:44px; border-radius:50%;" />
            </a>
          </td>
          <td align="center" style="padding:4px;">
            <a href="{{instagram_url}}" style="display:inline-block;">
              <img src="https://placehold.co/88x88/E4405F/FFFFFF?text=IG" alt="Instagram" width="44" height="44" style="display:block; width:44px; height:44px; border-radius:50%;" />
            </a>
          </td>
          <td align="center" style="padding:4px;">
            <a href="{{linkedin_url}}" style="display:inline-block;">
              <img src="https://placehold.co/88x88/0077B5/FFFFFF?text=in" alt="LinkedIn" width="44" height="44" style="display:block; width:44px; height:44px; border-radius:50%;" />
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`,
            category: 'Social',
          },
          {
            id: 'social-share',
            label: 'Social Share',
            media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v18h18z"/></svg>',
            content: `
  <table role="presentation" width="100%" style="background:#F9FAFB;">
    <tr><td align="center" style="padding:24px 20px;">
      <p style="margin:0 0 12px 0; font:16px Arial,sans-serif; color:#374151;">Share this with your friends</p>
      <a href="{{share_facebook}}" style="display:inline-block; padding:12px 20px; margin:4px; border-radius:4px; background:#3b5998; color:#fff; text-decoration:none; font:14px Arial,sans-serif;">Facebook</a>
      <a href="{{share_twitter}}" style="display:inline-block; padding:12px 20px; margin:4px; border-radius:4px; background:#1DA1F2; color:#fff; text-decoration:none; font:14px Arial,sans-serif;">Twitter</a>
      <a href="{{share_linkedin}}" style="display:inline-block; padding:12px 20px; margin:4px; border-radius:4px; background:#0077B5; color:#fff; text-decoration:none; font:14px Arial,sans-serif;">LinkedIn</a>
    </td></tr>
  </table>`,
            category: 'Social',
          },

          // ========== EXTRA SPECIAL/E-COMMERCE ==========
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
            name: 'Layout',
            open: true,
            properties: [
              {
                name: 'Width',
                property: 'width',
                type: 'integer',
                units: ['px', '%'],
                min: 0,
              } as any,
              {
                name: 'Height',
                property: 'height',
                type: 'integer',
                units: ['px', 'auto'],
                min: 0,
              } as any,
              {
                name: 'Max Width',
                property: 'max-width',
                type: 'integer',
                units: ['px', '%'],
                min: 0,
              } as any,
              {
                name: 'Display',
                property: 'display',
                type: 'select',
                defaults: 'block',
                options: [
                  { id: 'block', value: 'block', name: 'Block' },
                  { id: 'inline', value: 'inline', name: 'Inline' },
                  { id: 'inline-block', value: 'inline-block', name: 'Inline Block' },
                  { id: 'table', value: 'table', name: 'Table' },
                  { id: 'table-cell', value: 'table-cell', name: 'Table Cell' },
                  { id: 'none', value: 'none', name: 'None' },
                ],
              } as any,
            ],
          },
          {
            name: 'Spacing',
            open: false,
            properties: [
              'padding',
              'margin',
            ],
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              {
                name: 'Font Family',
                property: 'font-family',
                type: 'select',
                defaults: 'Arial, sans-serif',
                options: [
                  { id: 'arial', value: 'Arial, sans-serif', name: 'Arial' },
                  { id: 'helvetica', value: "'Helvetica Neue', Helvetica, sans-serif", name: 'Helvetica' },
                  { id: 'times', value: "'Times New Roman', Times, serif", name: 'Times New Roman' },
                  { id: 'georgia', value: 'Georgia, serif', name: 'Georgia' },
                  { id: 'courier', value: "'Courier New', Courier, monospace", name: 'Courier New' },
                  { id: 'verdana', value: 'Verdana, sans-serif', name: 'Verdana' },
                  { id: 'tahoma', value: 'Tahoma, sans-serif', name: 'Tahoma' },
                  { id: 'trebuchet', value: "'Trebuchet MS', sans-serif", name: 'Trebuchet MS' },
                ],
              } as any,
              'font-size',
              {
                name: 'Font Weight',
                property: 'font-weight',
                type: 'select',
                defaults: 'normal',
                options: [
                  { id: 'normal', value: 'normal', name: 'Normal' },
                  { id: 'bold', value: 'bold', name: 'Bold' },
                  { id: '100', value: '100', name: 'Thin (100)' },
                  { id: '300', value: '300', name: 'Light (300)' },
                  { id: '400', value: '400', name: 'Regular (400)' },
                  { id: '500', value: '500', name: 'Medium (500)' },
                  { id: '600', value: '600', name: 'Semi Bold (600)' },
                  { id: '700', value: '700', name: 'Bold (700)' },
                  { id: '900', value: '900', name: 'Black (900)' },
                ],
              } as any,
              'color',
              'line-height',
              'letter-spacing',
              'text-align',
              'text-decoration',
              {
                name: 'Font Style',
                property: 'font-style',
                type: 'radio',
                defaults: 'normal',
                options: [
                  { id: 'normal', value: 'normal', name: 'Normal' },
                  { id: 'italic', value: 'italic', name: 'Italic' },
                ],
              } as any,
              {
                name: 'Text Transform',
                property: 'text-transform',
                type: 'select',
                defaults: 'none',
                options: [
                  { id: 'none', value: 'none', name: 'None' },
                  { id: 'uppercase', value: 'uppercase', name: 'Uppercase' },
                  { id: 'lowercase', value: 'lowercase', name: 'Lowercase' },
                  { id: 'capitalize', value: 'capitalize', name: 'Capitalize' },
                ],
              } as any,
            ],
          },
          {
            name: 'Background',
            open: false,
            properties: [
              'background-color',
              {
                name: 'Background Image',
                property: 'background-image',
                type: 'text',
                defaults: 'none',
              } as any,
              {
                name: 'Background Repeat',
                property: 'background-repeat',
                type: 'select',
                defaults: 'repeat',
                options: [
                  { id: 'repeat', value: 'repeat', name: 'Repeat' },
                  { id: 'repeat-x', value: 'repeat-x', name: 'Repeat X' },
                  { id: 'repeat-y', value: 'repeat-y', name: 'Repeat Y' },
                  { id: 'no-repeat', value: 'no-repeat', name: 'No Repeat' },
                ],
              } as any,
              {
                name: 'Background Position',
                property: 'background-position',
                type: 'select',
                defaults: 'left top',
                options: [
                  { id: 'left-top', value: 'left top', name: 'Left Top' },
                  { id: 'left-center', value: 'left center', name: 'Left Center' },
                  { id: 'left-bottom', value: 'left bottom', name: 'Left Bottom' },
                  { id: 'center-top', value: 'center top', name: 'Center Top' },
                  { id: 'center-center', value: 'center center', name: 'Center Center' },
                  { id: 'center-bottom', value: 'center bottom', name: 'Center Bottom' },
                  { id: 'right-top', value: 'right top', name: 'Right Top' },
                  { id: 'right-center', value: 'right center', name: 'Right Center' },
                  { id: 'right-bottom', value: 'right bottom', name: 'Right Bottom' },
                ],
              } as any,
              {
                name: 'Background Size',
                property: 'background-size',
                type: 'select',
                defaults: 'auto',
                options: [
                  { id: 'auto', value: 'auto', name: 'Auto' },
                  { id: 'cover', value: 'cover', name: 'Cover' },
                  { id: 'contain', value: 'contain', name: 'Contain' },
                ],
              } as any,
            ],
          },
          {
            name: 'Border',
            open: false,
            properties: [
              'border',
              'border-radius',
            ],
          },
          {
            name: 'Table Styles',
            open: false,
            properties: [
              {
                name: 'Vertical Align',
                property: 'vertical-align',
                type: 'select',
                defaults: 'top',
                options: [
                  { id: 'top', value: 'top', name: 'Top' },
                  { id: 'middle', value: 'middle', name: 'Middle' },
                  { id: 'bottom', value: 'bottom', name: 'Bottom' },
                  { id: 'baseline', value: 'baseline', name: 'Baseline' },
                ],
              } as any,
              {
                name: 'White Space',
                property: 'white-space',
                type: 'select',
                defaults: 'normal',
                options: [
                  { id: 'normal', value: 'normal', name: 'Normal' },
                  { id: 'nowrap', value: 'nowrap', name: 'No Wrap' },
                  { id: 'pre', value: 'pre', name: 'Pre' },
                  { id: 'pre-wrap', value: 'pre-wrap', name: 'Pre Wrap' },
                ],
              } as any,
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
        this.saveTemplate();
      },
    });

    // Import template command (using GrapeJS modal)
    this.editor.Commands.add('import-template', {
      run: (editor: any) => {
        const modal = editor.Modal;
        modal.setTitle('Import Email Template');
        modal.setContent(`
          <div style="padding: 20px;">
            <p style="margin-bottom: 10px; color: #374151;">Paste your email template HTML code here:</p>
            <textarea id="import-html" style="width: 100%; height: 300px; padding: 10px; border: 1px solid #E5E7EB; border-radius: 4px; font-family: monospace; resize: vertical;" placeholder="Paste your HTML template here..."></textarea>
            <div style="margin-top: 20px; text-align: right;">
              <button id="cancel-import-btn" style="padding: 8px 16px; background-color: #E5E7EB; color: #374151; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Cancel</button>
              <button id="import-btn" style="padding: 8px 16px; background-color: #F59E0B; color: white; border: none; border-radius: 4px; cursor: pointer;">Import Template</button>
            </div>
          </div>
        `);
        modal.open();

        // Handle import button click
        setTimeout(() => {
          document.getElementById('cancel-import-btn')?.addEventListener('click', () => {
            modal.close();
          });

          document.getElementById('import-btn')?.addEventListener('click', () => {
            const html = (document.getElementById('import-html') as HTMLTextAreaElement)?.value;
            if (html && html.trim()) {
              editor.setComponents(html);
              modal.close();
              alert('✅ Template imported successfully!');
            } else {
              alert('⚠️ Please paste some HTML code first.');
            }
          });
        }, 100);
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

    // Export template command (use juice only for export)
    this.editor.Commands.add('export-template', {
      run: (editor: any) => {
        const html = editor.getHtml();
        const css = editor.getCss();

        // Create the full HTML with styles in head
        let fullHtml = `<!DOCTYPE html>
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

        // Use juice to inline CSS for email compatibility
        try {
          fullHtml = juice(fullHtml);
        } catch (error) {
          console.error('Error inlining styles:', error);
          alert('⚠️ Warning: Could not inline all styles. Exported with <style> tag instead.');
        }

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'email-template-' + Date.now() + '.html';
        link.click();
        URL.revokeObjectURL(url);

        alert('✅ Email template exported successfully with inlined CSS!');
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

    // Asset upload event listeners
    this.editor.on('asset:upload:start', () => {
      console.log('Asset upload started');
    });

    this.editor.on('asset:upload:end', () => {
      console.log('Asset upload completed');
    });

    this.editor.on('asset:upload:error', (err: any) => {
      console.error('Asset upload error:', err);
      alert(`Failed to upload asset: ${err.message || 'Unknown error'}`);
    });

    this.editor.on('asset:upload:response', (response: any) => {
      console.log('Asset upload response:', response);
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

  // Backend integration methods
  protected saveTemplate(): void {
    if (this.templateId) {
      // Update existing template
      this.updateExistingTemplate();
    } else {
      // Show dialog to save new template
      this.showSaveDialog.set(true);
    }
  }

  protected saveNewTemplate(name: string, description: string = ''): void {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    this.isSaving.set(true);
    
    const templateData = {
      name: name.trim(),
      description: description.trim(),
      html: this.editor.getHtml(),
      css: this.editor.getCss(),
      components: JSON.parse(JSON.stringify(this.editor.getComponents())),
      styles: JSON.parse(JSON.stringify(this.editor.getStyle())),
      status: 'draft'
    };

    this.templateService.createTemplate(templateData).subscribe({
      next: (template) => {
        this.templateId = template.id;
        this.templateName.set(template.name);
        this.lastSaved.set(new Date());
        this.isSaving.set(false);
        this.showSaveDialog.set(false);
        
        // Update URL without reloading
        this.router.navigate(['/editor', template.id], { replaceUrl: true });
        
        alert('✅ Template saved successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(`Failed to save template: ${err.message}`);
      }
    });
  }

  protected updateExistingTemplate(): void {
    if (!this.templateId) return;

    this.isSaving.set(true);
    
    const updateData = {
      html: this.editor.getHtml(),
      css: this.editor.getCss(),
      components: JSON.parse(JSON.stringify(this.editor.getComponents())),
      styles: JSON.parse(JSON.stringify(this.editor.getStyle()))
    };

    this.templateService.updateTemplate(this.templateId, updateData).subscribe({
      next: () => {
        this.lastSaved.set(new Date());
        this.isSaving.set(false);
        alert('✅ Template updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(`Failed to update template: ${err.message}`);
      }
    });
  }

  protected cancelSave(): void {
    this.showSaveDialog.set(false);
  }

  protected goBackToTemplates(): void {
    if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
      this.router.navigate(['/']);
    }
  }

  protected getLastSavedText(): string {
    const lastSavedDate = this.lastSaved();
    if (!lastSavedDate) return 'Not saved';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSavedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return lastSavedDate.toLocaleString();
  }
}
