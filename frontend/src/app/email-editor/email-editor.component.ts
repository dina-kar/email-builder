import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import grapesjs from 'grapesjs';
import grapesjsMJML from 'grapesjs-mjml';
import html2canvas from 'html2canvas';
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
  private contentChanged = signal(false);
  
  protected searchTerm = signal('');
  protected templateName = signal('Untitled Template');
  protected emailTitle = signal('');
  protected emailPreview = signal('');
  protected isSaving = signal(false);
  protected lastSaved = signal<Date | null>(null);
  protected showSaveDialog = signal(false);
  protected saveMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

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
    
    // Setup auto-save every 10 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.templateId && !this.isSaving() && this.contentChanged()) {
        this.autoSaveTemplate();
      }
    }, 10000);
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
        
        // Load MJML content into editor
        if (template.mjml) {
          // Extract title and preview from MJML
          this.extractEmailMetadata(template.mjml);
          
          // Remove <mj-head> section before loading into editor
          const mjmlWithoutHead = this.removeHeadSection(template.mjml);
          this.editor.setComponents(mjmlWithoutHead);
        } else if (template.components) {
          // Fallback to components if MJML not available
          this.editor.setComponents(template.components);
        }
        
        if (template.styles) {
          this.editor.setStyle(template.styles);
        }
        
        this.lastSaved.set(new Date(template.updatedAt));
        this.contentChanged.set(false);
      },
      error: (err) => {
        console.error('Error loading template:', err);
        this.showMessage(`Failed to load template: ${err.message}`, 'error');
        this.router.navigate(['/']);
      }
    });
  }

  private autoSaveTemplate(): void {
    if (!this.templateId) return;
    
    this.isSaving.set(true);
    
    const updateData = {
      mjml: this.injectEmailMetadata(this.editor.getHtml()), // Store MJML code with metadata
      components: JSON.parse(JSON.stringify(this.editor.getComponents())),
      styles: JSON.parse(JSON.stringify(this.editor.getStyle()))
    };
    
    this.templateService.updateTemplate(this.templateId, updateData).subscribe({
      next: () => {
        this.lastSaved.set(new Date());
        this.contentChanged.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Auto-save failed:', err);
        this.isSaving.set(false);
        this.showMessage('Auto-save failed', 'error');
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
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '', // Default width
          },
          {
            id: 'tablet',
            name: 'Tablet',
            width: '768px',
            widthMedia: '768px',
          },
          {
            id: 'mobilePortrait',
            name: 'Mobile portrait',
            width: '375px',
            widthMedia: '480px',
          },
        ],
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
      plugins: [grapesjsMJML],
      pluginsOpts: {
        [grapesjsMJML as any]: {
          // MJML Plugin options
          resetBlocks: true,
          resetDevices: false,
          resetStyleManager: true,
          hideSelector: true,
          columnsPadding: '10px 0',
          useCustomTheme: true,
          imagePlaceholderSrc: 'https://via.placeholder.com/350x250/78c5d6/fff',
          // Overwrite default export to use our custom export command
          overwriteExport: false,
        }
      },
      panels: {
        defaults: []
      },
      blockManager: {
        appendTo: '#blocks-container',
      },
      layerManager: {
        appendTo: '#layers-container',
      },
      selectorManager: {
        appendTo: '#styles-container',
      },
      styleManager: {
        appendTo: '#styles-container',
      },
      traitManager: {
        appendTo: '#traits-container',
      },
      canvas: {
        styles: [],
        scripts: [],
      },
    });

    // Add custom commands
    this.addCustomCommands();
    
    // Add custom MJML blocks
    this.addCustomMJMLBlocks();

    // MJML plugin will handle the default template
    this.editor.on('load', () => {
      if (!this.templateId) {
        const hasContent = this.editor.getComponents().length > 0;
        if (!hasContent) {
          // Set a better default MJML template with distinct visual sections
          this.editor.setComponents(`<mjml>
  
  <mj-body background-color="#f4f4f4">
    <!-- Header Section -->
    <mj-section background-color="#F59E0B" padding="20px">
      <mj-column>
        <mj-text align="center" color="#ffffff" font-size="28px" font-weight="bold">
          Your Brand
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Main Content (600px Container) -->
    <mj-wrapper background-color="#ffffff" padding="0">
      <mj-section background-color="#ffffff" padding="40px 25px">
        <mj-column>
          <mj-text font-size="24px" font-weight="bold" color="#111827" padding-bottom="20px">
            Welcome to Your Email Template
          </mj-text>
          <mj-text color="#4B5563">
            Start building your email by dragging and dropping components from the left sidebar. This white section is your main 600px email container - perfect for content that needs to look great across all email clients.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section background-color="#ffffff" padding="20px 25px">
        <mj-column width="50%">
          <mj-image src="https://placehold.co/600x400/000000/FFF" alt="Placeholder" />
        </mj-column>
        <mj-column width="50%">
          <mj-text font-size="18px" font-weight="bold" color="#111827">
            Feature Title
          </mj-text>
          <mj-text color="#4B5563" font-size="14px">
            Add your content here. Drag components to build your email layout.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section background-color="#ffffff" padding="30px 25px">
        <mj-column>
          <mj-button background-color="#F59E0B" color="#ffffff" font-weight="bold" href="#">
            Call to Action
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <!-- Footer Section (Outside 600px Container) -->
    <mj-section background-color="#111827" padding="30px 25px">
      <mj-column>
        <mj-text align="center" color="#9CA3AF" font-size="12px">
          © 2025 Your Company. All rights reserved.
        </mj-text>
        <mj-text align="center" font-size="11px" padding-top="10px">
          <a href="#" style="color: #F59E0B; text-decoration: none;">Unsubscribe</a> | 
          <a href="#" style="color: #F59E0B; text-decoration: none;">Preferences</a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`);
        }
      }
    });
  }

  private addCustomMJMLBlocks(): void {
    const bm = this.editor.BlockManager;

    // Article Block
    bm.add('article-block', {
      label: 'Article',
      content: `
        <mj-section padding="20px">
          <mj-column>
            <mj-image src="https://via.placeholder.com/600x300/F59E0B/FFFFFF?text=Article+Image" alt="Article" />
            <mj-text font-size="24px" font-weight="bold" padding-top="20px">
              Article Title
            </mj-text>
            <mj-text font-size="14px" color="#666666" line-height="1.6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </mj-text>
            <mj-button background-color="#F59E0B" href="#">
              Read More
            </mj-button>
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`
    });

    // Feature List Block
    bm.add('feature-list', {
      label: 'Feature List',
      content: `
        <mj-section background-color="#F9FAFB" padding="30px">
          <mj-column width="33.33%">
            <mj-image src="https://via.placeholder.com/100/F59E0B/FFFFFF?text=1" alt="Feature 1" width="80px" />
            <mj-text align="center" font-weight="bold" font-size="18px">
              Feature One
            </mj-text>
            <mj-text align="center" font-size="14px" color="#666666">
              Description of feature one
            </mj-text>
          </mj-column>
          <mj-column width="33.33%">
            <mj-image src="https://via.placeholder.com/100/FBBF24/FFFFFF?text=2" alt="Feature 2" width="80px" />
            <mj-text align="center" font-weight="bold" font-size="18px">
              Feature Two
            </mj-text>
            <mj-text align="center" font-size="14px" color="#666666">
              Description of feature two
            </mj-text>
          </mj-column>
          <mj-column width="33.33%">
            <mj-image src="https://via.placeholder.com/100/D97706/FFFFFF?text=3" alt="Feature 3" width="80px" />
            <mj-text align="center" font-weight="bold" font-size="18px">
              Feature Three
            </mj-text>
            <mj-text align="center" font-size="14px" color="#666666">
              Description of feature three
            </mj-text>
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8v8H3zm10 0h8v8h-8zM3 3h8v8H3zm15 0v8h-5V3z"/></svg>`
    });

    // Testimonial Block
    bm.add('testimonial', {
      label: 'Testimonial',
      content: `
        <mj-section background-color="#FEF3C7" padding="30px">
          <mj-column>
            <mj-text align="center" font-size="18px" font-style="italic" color="#92400E">
              "This is an amazing product! It has completely transformed the way we work."
            </mj-text>
            <mj-text align="center" font-weight="bold" padding-top="10px">
              - John Doe, CEO
            </mj-text>
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>`
    });

    // CTA Banner Block
    bm.add('cta-banner', {
      label: 'CTA Banner',
      content: `
        <mj-section background-color="#F59E0B" padding="40px">
          <mj-column>
            <mj-text align="center" font-size="28px" font-weight="bold" color="#ffffff">
              Ready to Get Started?
            </mj-text>
            <mj-text align="center" font-size="16px" color="#ffffff" padding-top="10px">
              Join thousands of satisfied customers today
            </mj-text>
            <mj-button background-color="#ffffff" color="#F59E0B" font-weight="bold" href="#">
              Sign Up Now
            </mj-button>
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v18h18V3zm-2 16H5V5h14v14z"/></svg>`
    });

    // Product Showcase Block
    bm.add('product-showcase', {
      label: 'Product Showcase',
      content: `
        <mj-section padding="20px">
          <mj-column width="40%">
            <mj-image src="https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Product" alt="Product" />
          </mj-column>
          <mj-column width="60%">
            <mj-text font-size="24px" font-weight="bold">
              Product Name
            </mj-text>
            <mj-text font-size="18px" color="#F59E0B" font-weight="bold" padding="10px 0">
              $99.99
            </mj-text>
            <mj-text font-size="14px" color="#666666" line-height="1.6">
              Discover our latest product with amazing features and benefits. Perfect for all your needs.
            </mj-text>
            <mj-button background-color="#F59E0B" href="#">
              Buy Now
            </mj-button>
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`
    });

    // Footer Block
    bm.add('footer-block', {
      label: 'Footer',
      content: `
        <mj-section background-color="#111827" padding="30px">
          <mj-column>
            <mj-social font-size="15px" icon-size="30px" mode="horizontal" align="center">
              <mj-social-element name="facebook" href="#" />
              <mj-social-element name="twitter" href="#" />
              <mj-social-element name="instagram" href="#" />
              <mj-social-element name="linkedin" href="#" />
            </mj-social>
            <mj-text align="center" color="#ffffff" font-size="12px" padding-top="20px">
              © 2025 Your Company. All rights reserved.
            </mj-text>
            <mj-text align="center" color="#9CA3AF" font-size="11px">
              123 Street Name, City, ST 12345
            </mj-text>
            <mj-text align="center" font-size="11px" padding-top="10px">
              <a href="#" style="color: #F59E0B; text-decoration: none;">Unsubscribe</a> | 
              <a href="#" style="color: #F59E0B; text-decoration: none;">Preferences</a>
            </mj-text>
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 20h16v-2H4v2zm0-4h16v-2H4v2zm0-6v2h16V10H4zm0-4v2h16V6H4z"/></svg>`
    });

    // Divider Block
    bm.add('styled-divider', {
      label: 'Styled Divider',
      content: `
        <mj-section padding="20px">
          <mj-column>
            <mj-divider border-color="#F59E0B" border-width="3px" width="100px" />
          </mj-column>
        </mj-section>
      `,
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11h18v2H3z"/></svg>`
    });
  }

  private addCustomCommands(): void {
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
        modal.setTitle('Import MJML Template');
        modal.setContent(`
          <div style="padding: 20px;">
            <p style="margin-bottom: 10px; color: #374151;">Paste your MJML template code here:</p>
            <textarea id="import-html" style="width: 100%; height: 300px; padding: 10px; border: 1px solid #E5E7EB; border-radius: 4px; font-family: monospace; resize: vertical;" placeholder="Paste your MJML template here..."></textarea>
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
            const code = (document.getElementById('import-html') as HTMLTextAreaElement)?.value;
            if (code && code.trim()) {
              // Check if it's valid MJML
              const isMJML = code.trim().toLowerCase().includes('<mjml') || 
                            code.trim().toLowerCase().includes('<mj-');
              
              if (!isMJML) {
                this.showMessage('Only MJML code is supported. Please paste valid MJML.', 'error');
                return;
              }
              
              // Import MJML - ensure body has gray background
              let mjmlCode = code;
              // Check if mj-body exists and add/update background-color
              if (mjmlCode.includes('<mj-body')) {
                // If mj-body already has background-color, replace it
                if (/background-color\s*=\s*["'][^"']*["']/.test(mjmlCode)) {
                  mjmlCode = mjmlCode.replace(/(<mj-body[^>]*background-color\s*=\s*["'])[^"']*/, '$1#f4f4f4');
                } else {
                  // Add background-color if it doesn't exist
                  mjmlCode = mjmlCode.replace(/<mj-body/, '<mj-body background-color="#f4f4f4"');
                }
              }
              
              // Extract title and preview from imported MJML
              this.extractEmailMetadata(mjmlCode);
              
              // Remove <mj-head> section from the MJML before setting components
              mjmlCode = this.removeHeadSection(mjmlCode);
              
              editor.setComponents(mjmlCode);
              modal.close();
              this.showMessage('Template imported successfully!', 'success');
            } else {
              this.showMessage('Please paste some code first.', 'error');
            }
          });
        }, 100);
      },
    });

    // Clear canvas command
    this.editor.Commands.add('clear-canvas', {
      run: (editor: any) => {
        if (confirm('⚠️ Are you sure you want to clear the canvas? This cannot be undone.')) {
          // Set the improved default MJML template
          editor.setComponents(`<mjml>
  <mj-body background-color="#f4f4f4">
    <!-- Header Section -->
    <mj-section background-color="#F59E0B" padding="20px">
      <mj-column>
        <mj-text align="center" color="#ffffff" font-size="28px" font-weight="bold">
          Your Brand
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Main Content (600px Container) -->
    <mj-wrapper background-color="#ffffff" padding="0">
      <mj-section background-color="#ffffff" padding="40px 25px">
        <mj-column>
          <mj-text font-size="24px" font-weight="bold" color="#111827" padding-bottom="20px">
            Welcome to Your Email Template
          </mj-text>
          <mj-text color="#4B5563">
            Start building your email by dragging and dropping components from the left sidebar. This white section is your main 600px email container - perfect for content that needs to look great across all email clients.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section background-color="#ffffff" padding="20px 25px">
        <mj-column width="50%">
          <mj-image src="https://placehold.co/600x400/000000/FFF" alt="Placeholder" />
        </mj-column>
        <mj-column width="50%">
          <mj-text font-size="18px" font-weight="bold" color="#111827">
            Feature Title
          </mj-text>
          <mj-text color="#4B5563" font-size="14px">
            Add your content here. Drag components to build your email layout.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section background-color="#ffffff" padding="30px 25px">
        <mj-column>
          <mj-button background-color="#F59E0B" color="#ffffff" font-weight="bold" href="#">
            Call to Action
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <!-- Footer Section (Outside 600px Container) -->
    <mj-section background-color="#111827" padding="30px 25px">
      <mj-column>
        <mj-text align="center" color="#9CA3AF" font-size="12px">
          © 2025 Your Company. All rights reserved.
        </mj-text>
        <mj-text align="center" font-size="11px" padding-top="10px">
          <a href="#" style="color: #F59E0B; text-decoration: none;">Unsubscribe</a> | 
          <a href="#" style="color: #F59E0B; text-decoration: none;">Preferences</a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`);
        }
      },
    });

    // Export template command (MJML to HTML conversion)
    this.editor.Commands.add('export-template', {
      run: (editor: any) => {
        try {
          // Get MJML code
          const mjmlCode = editor.getHtml();
          
          // Get the compiled HTML from canvas
          const iframe = editor.Canvas.getFrameEl();
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const mjmlElement = iframeDoc.querySelector('[data-gjs-type="mjml"]');
          
          let html = '';
          if (mjmlElement) {
            html = mjmlElement.innerHTML;
          } else {
            // Fallback to getting body content
            const bodyContent = iframeDoc.body.innerHTML;
            html = bodyContent;
          }

          // Create the full HTML document
          let fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0;">
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

          this.showMessage('Email template exported successfully!', 'success');
        } catch (error) {
          console.error('Error exporting template:', error);
          this.showMessage('Error exporting template. Please try again.', 'error');
        }
      },
    });

    // View MJML Code command
    this.editor.Commands.add('view-mjml', {
      run: (editor: any) => {
        const modal = editor.Modal;
        const mjmlCode = editor.getHtml();
        
        modal.setTitle('MJML Code');
        modal.setContent(`
          <div style="padding: 20px;">
            <p style="margin-bottom: 10px; color: #374151;">MJML source code:</p>
            <textarea readonly id="mjml-code-view" style="width: 100%; height: 400px; padding: 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; resize: vertical; background: #F9FAFB;">${mjmlCode}</textarea>
            <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
              <button id="copy-mjml-btn" style="padding: 8px 16px; background-color: #F59E0B; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                Copy to Clipboard
              </button>
              <button id="close-mjml-btn" style="padding: 8px 16px; background-color: #E5E7EB; color: #374151; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                Close
              </button>
            </div>
          </div>
        `);
        modal.open();

        setTimeout(() => {
          document.getElementById('copy-mjml-btn')?.addEventListener('click', () => {
            const textarea = document.getElementById('mjml-code-view') as HTMLTextAreaElement;
            textarea.select();
            document.execCommand('copy');
            this.showMessage('MJML code copied to clipboard!', 'success');
          });

          document.getElementById('close-mjml-btn')?.addEventListener('click', () => {
            modal.close();
          });
        }, 100);
      },
    });

    // View HTML Code command
    this.editor.Commands.add('view-html', {
      run: (editor: any) => {
        const modal = editor.Modal;
        
        try {
          // Get the compiled HTML from MJML using the correct method
          const mjmlCode = editor.getHtml();
          
          // Use MJML parser to compile
          let htmlCode = '';
          if (typeof (window as any).mjml2html !== 'undefined') {
            const result = (window as any).mjml2html(mjmlCode);
            htmlCode = result.html || '';
          } else {
            // Fallback: try to get from editor's internal compilation
            const components = editor.DomComponents.getWrapper();
            const mjmlComponent = components.find('[data-gjs-type="mjml"]')[0];
            if (mjmlComponent) {
              htmlCode = mjmlComponent.view?.el?.innerHTML || editor.getHtml();
            } else {
              htmlCode = editor.getHtml();
            }
          }
          
          const escapedHtml = htmlCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          
          modal.setTitle('Compiled HTML Code');
          modal.setContent(`
            <div style="padding: 20px;">
              <p style="margin-bottom: 10px; color: #374151;">Production-ready HTML code with inlined CSS:</p>
              <textarea readonly id="html-code-view" style="width: 100%; height: 400px; padding: 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; resize: vertical; background: #F9FAFB;">${htmlCode}</textarea>
              <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <button id="copy-html-btn" style="padding: 8px 16px; background-color: #F59E0B; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                  Copy to Clipboard
                </button>
                <button id="close-html-btn" style="padding: 8px 16px; background-color: #E5E7EB; color: #374151; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                  Close
                </button>
              </div>
            </div>
          `);
          modal.open();

          setTimeout(() => {
          document.getElementById('copy-html-btn')?.addEventListener('click', () => {
            const textarea = document.getElementById('html-code-view') as HTMLTextAreaElement;
            textarea.select();
            document.execCommand('copy');
            this.showMessage('HTML code copied to clipboard!', 'success');
          });            document.getElementById('close-html-btn')?.addEventListener('click', () => {
              modal.close();
            });
          }, 100);
          } catch (error) {
          console.error('Error getting HTML:', error);
          this.showMessage('Error compiling MJML to HTML. Please check your MJML structure.', 'error');
        }
      },
    });
  }

  private setupEventListeners(): void {
    // Track content changes
    this.editor.on('component:add component:remove component:update change:changesCount', () => {
      this.contentChanged.set(true);
    });

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
    this.editor.setDevice('desktop');
  }

  protected setDeviceTablet(): void {
    this.editor.setDevice('tablet');
  }

  protected setDeviceMobile(): void {
    this.editor.setDevice('mobilePortrait');
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

  protected viewMJML(): void {
    this.editor.runCommand('view-mjml');
  }

  protected viewHTML(): void {
    this.editor.runCommand('view-html');
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
      this.showMessage('Please enter a template name', 'error');
      return;
    }

    this.isSaving.set(true);
    
    // Generate thumbnail from the canvas
    this.generateThumbnail().then((thumbnailDataUrl) => {
      const templateData = {
        name: name.trim(),
        description: description.trim(),
        mjml: this.injectEmailMetadata(this.editor.getHtml()), // Store MJML code with metadata
        components: JSON.parse(JSON.stringify(this.editor.getComponents())),
        styles: JSON.parse(JSON.stringify(this.editor.getStyle())),
        thumbnail: thumbnailDataUrl, // Store base64 thumbnail
        status: 'draft'
      };

      this.templateService.createTemplate(templateData).subscribe({
        next: (template) => {
          this.templateId = template.id;
          this.templateName.set(template.name);
          this.lastSaved.set(new Date());
          this.contentChanged.set(false);
          this.isSaving.set(false);
          this.showSaveDialog.set(false);
          
          // Update URL without reloading
          this.router.navigate(['/editor', template.id], { replaceUrl: true });
          
          this.showMessage('Template saved successfully!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.showMessage(`Failed to save template: ${err.message}`, 'error');
        }
      });
    }).catch((err) => {
      console.error('Failed to generate thumbnail:', err);
      // Save without thumbnail if generation fails
      const templateData = {
        name: name.trim(),
        description: description.trim(),
        mjml: this.injectEmailMetadata(this.editor.getHtml()),
        components: JSON.parse(JSON.stringify(this.editor.getComponents())),
        styles: JSON.parse(JSON.stringify(this.editor.getStyle())),
        status: 'draft'
      };

      this.templateService.createTemplate(templateData).subscribe({
        next: (template) => {
          this.templateId = template.id;
          this.templateName.set(template.name);
          this.lastSaved.set(new Date());
          this.contentChanged.set(false);
          this.isSaving.set(false);
          this.showSaveDialog.set(false);
          this.router.navigate(['/editor', template.id], { replaceUrl: true });
          this.showMessage('Template saved successfully!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.showMessage(`Failed to save template: ${err.message}`, 'error');
        }
      });
    });
  }

  protected updateExistingTemplate(): void {
    if (!this.templateId) return;

    this.isSaving.set(true);
    
    // Generate updated thumbnail
    this.generateThumbnail().then((thumbnailDataUrl) => {
      const updateData = {
        mjml: this.injectEmailMetadata(this.editor.getHtml()), // Store MJML code with metadata
        components: JSON.parse(JSON.stringify(this.editor.getComponents())),
        styles: JSON.parse(JSON.stringify(this.editor.getStyle())),
        thumbnail: thumbnailDataUrl // Update thumbnail
      };

      this.templateService.updateTemplate(this.templateId!, updateData).subscribe({
        next: () => {
          this.lastSaved.set(new Date());
          this.contentChanged.set(false);
          this.isSaving.set(false);
          this.showMessage('Template saved successfully!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.showMessage(`Failed to update template: ${err.message}`, 'error');
        }
      });
    }).catch((err) => {
      console.error('Failed to generate thumbnail:', err);
      // Update without thumbnail if generation fails
      const updateData = {
        mjml: this.injectEmailMetadata(this.editor.getHtml()),
        components: JSON.parse(JSON.stringify(this.editor.getComponents())),
        styles: JSON.parse(JSON.stringify(this.editor.getStyle()))
      };

      this.templateService.updateTemplate(this.templateId!, updateData).subscribe({
        next: () => {
          this.lastSaved.set(new Date());
          this.contentChanged.set(false);
          this.isSaving.set(false);
          this.showMessage('Template saved successfully!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.showMessage(`Failed to update template: ${err.message}`, 'error');
        }
      });
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
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffSecs < 10) return 'Saved just now';
    if (diffSecs < 60) return `Saved ${diffSecs} seconds ago`;
    if (diffMins === 1) return 'Saved 1 minute ago';
    if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Saved 1 hour ago';
    if (diffHours < 24) return `Saved ${diffHours} hours ago`;
    
    // For older saves, show the actual time
    return 'Saved at ' + lastSavedDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Show a toast message
   */
  private showMessage(text: string, type: 'success' | 'error'): void {
    this.saveMessage.set({ text, type });
    setTimeout(() => {
      this.saveMessage.set(null);
    }, 3000);
  }

  /**
   * Extract email title and preview text from MJML code
   */
  private extractEmailMetadata(mjmlCode: string): void {
    // Extract title from <mj-title>
    const titleMatch = mjmlCode.match(/<mj-title[^>]*>(.*?)<\/mj-title>/is);
    if (titleMatch && titleMatch[1]) {
      this.emailTitle.set(titleMatch[1].trim());
    } else {
      this.emailTitle.set('');
    }

    // Extract preview from <mj-preview>
    const previewMatch = mjmlCode.match(/<mj-preview[^>]*>(.*?)<\/mj-preview>/is);
    if (previewMatch && previewMatch[1]) {
      this.emailPreview.set(previewMatch[1].trim());
    } else {
      this.emailPreview.set('');
    }
  }

  /**
   * Inject email title and preview text into MJML code
   */
  private injectEmailMetadata(mjmlCode: string): string {
    let updatedMjml = mjmlCode;

    // Check if <mj-head> exists
    const hasHead = updatedMjml.includes('<mj-head>');
    
    if (!hasHead) {
      // Create <mj-head> section after <mjml> opening tag
      const headContent = this.buildHeadContent();
      updatedMjml = updatedMjml.replace(
        /<mjml([^>]*)>/i,
        `<mjml$1>\n  <mj-head>\n${headContent}  </mj-head>\n`
      );
    } else {
      // Update existing <mj-head>
      const titleValue = this.emailTitle();
      const previewValue = this.emailPreview();

      // Handle <mj-title>
      if (updatedMjml.includes('<mj-title>')) {
        if (titleValue) {
          updatedMjml = updatedMjml.replace(
            /<mj-title[^>]*>.*?<\/mj-title>/is,
            `<mj-title>${titleValue}</mj-title>`
          );
        } else {
          // Remove empty title
          updatedMjml = updatedMjml.replace(/<mj-title[^>]*>.*?<\/mj-title>\s*/is, '');
        }
      } else if (titleValue) {
        // Add title to head
        updatedMjml = updatedMjml.replace(
          /<mj-head>/i,
          `<mj-head>\n    <mj-title>${titleValue}</mj-title>`
        );
      }

      // Handle <mj-preview>
      if (updatedMjml.includes('<mj-preview>')) {
        if (previewValue) {
          updatedMjml = updatedMjml.replace(
            /<mj-preview[^>]*>.*?<\/mj-preview>/is,
            `<mj-preview>${previewValue}</mj-preview>`
          );
        } else {
          // Remove empty preview
          updatedMjml = updatedMjml.replace(/<mj-preview[^>]*>.*?<\/mj-preview>\s*/is, '');
        }
      } else if (previewValue) {
        // Add preview to head
        updatedMjml = updatedMjml.replace(
          /<mj-head>/i,
          `<mj-head>\n    <mj-preview>${previewValue}</mj-preview>`
        );
      }
    }

    return updatedMjml;
  }

  /**
   * Remove <mj-head> section from MJML code
   */
  private removeHeadSection(mjmlCode: string): string {
    // Remove the entire <mj-head>...</mj-head> section
    return mjmlCode.replace(/<mj-head[^>]*>[\s\S]*?<\/mj-head>\s*/gi, '');
  }

  /**
   * Build the head content with title and preview
   */
  private buildHeadContent(): string {
    const titleValue = this.emailTitle();
    const previewValue = this.emailPreview();
    let content = '';

    if (titleValue) {
      content += `    <mj-title>${titleValue}</mj-title>\n`;
    }
    if (previewValue) {
      content += `    <mj-preview>${previewValue}</mj-preview>\n`;
    }

    return content;
  }

  /**
   * Update email metadata when user edits the fields
   */
  protected onEmailTitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emailTitle.set(input.value);
    this.contentChanged.set(true);
  }

  protected onEmailPreviewChange(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.emailPreview.set(input.value);
    this.contentChanged.set(true);
  }

  /**
   * Generate thumbnail from the current canvas
   */
  private generateThumbnail(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Get the iframe containing the email preview
        const iframe = this.editor.Canvas.getFrameEl();
        if (!iframe) {
          reject(new Error('Canvas iframe not found'));
          return;
        }

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          reject(new Error('Cannot access iframe document'));
          return;
        }

        const body = iframeDoc.body;
        
        // Use html2canvas to capture the iframe content
        html2canvas(body, {
          allowTaint: true,
          useCORS: true,
          scale: 0.5, // Reduce scale for smaller file size
          width: 600,
          height: Math.min(body.scrollHeight, 800), // Limit height to avoid huge images
          windowWidth: 600,
          windowHeight: Math.min(body.scrollHeight, 800),
          backgroundColor: '#f4f4f4',
          logging: false,
          imageTimeout: 0,
          removeContainer: true
        }).then(canvas => {
          // Resize canvas to thumbnail size
          const thumbnailCanvas = document.createElement('canvas');
          const thumbnailWidth = 300;
          const thumbnailHeight = 200;
          
          thumbnailCanvas.width = thumbnailWidth;
          thumbnailCanvas.height = thumbnailHeight;
          
          const ctx = thumbnailCanvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Draw the captured canvas onto thumbnail canvas with proper scaling
          ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumbnailWidth, thumbnailHeight);

          // Convert to base64 with compression (JPEG at 0.7 quality)
          const dataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.7);
          
          console.log(`Thumbnail generated: ${dataUrl.length} characters`);
          resolve(dataUrl);
        }).catch(error => {
          console.error('html2canvas error:', error);
          // Fallback to simple placeholder if html2canvas fails
          this.generateFallbackThumbnail().then(resolve).catch(reject);
        });
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        // Fallback to simple placeholder
        this.generateFallbackThumbnail().then(resolve).catch(reject);
      }
    });
  }

  /**
   * Generate a simple fallback thumbnail if html2canvas fails
   */
  private generateFallbackThumbnail(): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const thumbnailWidth = 300;
      const thumbnailHeight = 200;
      
      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Draw a simple preview representation
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(0, 0, thumbnailWidth, thumbnailHeight);

      // Header section (amber)
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, 0, thumbnailWidth, 25);
      
      // Main content area (white)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 35, thumbnailWidth - 20, thumbnailHeight - 70);
      
      // Add some visual detail
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(20, 45, thumbnailWidth - 40, 8);
      ctx.fillRect(20, 58, thumbnailWidth - 60, 6);
      ctx.fillRect(20, 68, thumbnailWidth - 50, 6);
      
      // Represent an image placeholder
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(20, 80, (thumbnailWidth - 40) / 2 - 5, 50);
      
      // Represent button
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(20, 140, 60, 15);

      // Footer (dark)
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, thumbnailHeight - 25, thumbnailWidth, 25);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      resolve(dataUrl);
    });
  }
}
