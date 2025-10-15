import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import grapesjs from 'grapesjs';
import grapesjsPresetNewsletter from 'grapesjs-preset-newsletter';
import grapesjsPluginCkeditor from 'grapesjs-plugin-ckeditor';
import { TemplateService, Template } from '../services/template.service';

declare const CKEDITOR: any;

@Component({
  selector: 'app-email-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-builder.component.html',
  styleUrls: ['./email-builder.component.css']
})
export class EmailBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  editor: any;
  private host = 'https://grapesjs.com/';
  
  // Panel state
  leftPanelOpen = true;
  rightPanelOpen = true;
  activeTab: 'style' | 'traits' | 'layers' = 'style';
  componentOutlinesVisible = false;

  // Backend integration
  templates: Template[] = [];
  currentTemplateId: string | null = null;

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    // Migrate old templates from GrapesJS to C1X storage key
    this.migrateOldTemplates();
    
    // Load templates from backend
    this.loadTemplatesFromBackend();
  }

  ngAfterViewInit(): void {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeEditor();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  /* ========================================
     Template Migration
     ======================================== */
  private migrateOldTemplates(): void {
    // One-time migration from old storage key to new C1X branded key
    const oldKey = 'gjsProjectNl';
    const newKey = 'c1xEmailBuilder';
    
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);
    
    // Only migrate if old data exists and new data doesn't
    if (oldData && !newData) {
      try {
        localStorage.setItem(newKey, oldData);
        console.log('Successfully migrated templates to C1X Email Builder');
      } catch (error) {
        console.error('Failed to migrate templates:', error);
      }
    }
  }

  /* ========================================
     GrapesJS Editor Initialization
     ======================================== */
  private initializeEditor(): void {
    console.log('Initializing GrapesJS Editor...');
    
    // Initialize GrapesJS with custom configuration
    this.editor = grapesjs.init({
      container: '#gjs',
      fromElement: true,
      height: '100%',
      width: '100%',
      
      // Storage configuration
      storageManager: {
        type: 'local',
        options: {
          local: { key: 'c1xEmailBuilder' }
        }
      },
      
      // Asset manager configuration
      assetManager: {
        assets: [
          this.host + 'img/grapesjs-logo.png',
          this.host + 'img/tmp-blocks.jpg',
          this.host + 'img/tmp-tgl-images.jpg',
          this.host + 'img/tmp-send-test.jpg',
          this.host + 'img/tmp-devices.jpg',
        ],
        upload: false,
      },
      
      // Selector manager configuration
      selectorManager: { 
        componentFirst: true 
      },
      
      // Disable default panels - we'll use custom ones
      panels: { 
        defaults: [] 
      },
      
      // Attach managers to custom containers
      blockManager: { 
        appendTo: '#blocks'
      },
      styleManager: { 
        appendTo: '#styles-container'
      },
      layerManager: { 
        appendTo: '#layers-container'
      },
      traitManager: { 
        appendTo: '#traits-container'
      },
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '100%',
          },
          {
            id: 'tablet',
            name: 'Tablet',
            width: '768px',
            widthMedia: '768px',
          },
          {
            id: 'mobile',
            name: 'Mobile',
            width: '375px',
            widthMedia: '480px',
          }
        ]
      },
      
      // Plugins configuration
      plugins: [grapesjsPresetNewsletter, grapesjsPluginCkeditor],
      pluginsOpts: {
        'grapesjs-preset-newsletter': {
          modalLabelImport: 'Paste all your HTML code below and click import',
          modalLabelExport: 'Copy the code and use it wherever you want',
          codeViewerTheme: 'material',
          importPlaceholder: '<table class="table"><tr><td class="cell">Hello world!</td></tr></table>',
          inlineCss: true,
          updateStyleManager: true,
          showStylesOnChange: true,
          cellStyle: {
            'font-size': '14px',
            'font-weight': 300,
            'vertical-align': 'top',
            color: 'rgb(111, 119, 125)',
            margin: 0,
            padding: 0,
          }
        },
        'grapesjs-plugin-ckeditor': {
          onToolbar: (el: HTMLElement) => {
            el.style.minWidth = '350px';
          },
          options: {
            startupFocus: true,
            extraAllowedContent: '*(*);*{*}', // Allows any class and any inline style
            allowedContent: true, // Disable auto-formatting
            enterMode: 2, // CKEDITOR.ENTER_BR
            extraPlugins: 'sharedspace,justify,colorbutton,panelbutton,font',
            toolbar: [
              { name: 'styles', items: ['Font', 'FontSize'] },
              ['Bold', 'Italic', 'Underline', 'Strike'],
              { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
              { name: 'links', items: ['Link', 'Unlink'] },
              { name: 'colors', items: ['TextColor', 'BGColor'] },
            ],
            customConfig: ''
          }
        }
      }
    });

    console.log('GrapesJS Editor initialized:', this.editor);
    
    // Setup additional configurations
    this.setupCustomCommands();
    this.setupCanvasConfig();
    this.onEditorReady();
  }

  /* ========================================
     Canvas Configuration for Better Component Visibility
     ======================================== */
  private setupCanvasConfig(): void {
    const canvas = this.editor.Canvas;
    
    // Make canvas frame narrower with max-width
    canvas.getConfig().frameStyle = `
      max-width: 800px;
      margin: 0 auto;
    `;
    
    // Add component:add event to highlight newly dropped components
    this.editor.on('component:add', (component: any) => {
      // Flash the newly added component
      setTimeout(() => {
        if (component && component.view && component.view.el) {
          const el = component.view.el;
          el.style.transition = 'all 0.3s ease';
          
          // Select the component automatically
          this.editor.select(component);
          
          // Scroll to the component
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    });
    
    // Enhance component selection visibility
    this.editor.on('component:selected', (component: any) => {
      if (component && component.view && component.view.el) {
        const el = component.view.el;
        
        // Add a temporary highlight
        el.style.transition = 'all 0.3s ease';
        
        // Scroll to selected component
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    });
  }

  /* ========================================
     Custom Commands Setup
     ======================================== */
  private setupCustomCommands(): void {
    const cmdm = this.editor.Commands;
    
    // Canvas clear command
    cmdm.add('canvas-clear', () => {
      if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        this.editor.runCommand('core:canvas-clear');
        setTimeout(() => { 
          localStorage.removeItem('c1xEmailBuilder');
        }, 0);
      }
    });
    
    // Preview command
    cmdm.add('preview', {
      run: (editor: any) => {
        editor.runCommand('preview');
      },
      stop: (editor: any) => {
        editor.stopCommand('preview');
      }
    });
    
    // Export command
    cmdm.add('export-template', {
      run: (editor: any) => {
        const modal = editor.Modal;
        const container = document.createElement('div');
        const textarea = document.createElement('textarea');
        const copyBtn = document.createElement('button');

        // Style the container
        container.style.cssText = `
          padding: 20px;
          background: white;
          border-radius: 8px;
        `;

        // Style the textarea
        textarea.style.cssText = `
          width: 100%;
          height: 400px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.4;
          resize: vertical;
          box-sizing: border-box;
          margin-bottom: 12px;
        `;

        // Style the copy button
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.style.cssText = `
          background: #FFC107;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        `;

        copyBtn.onclick = () => {
          textarea.select();
          document.execCommand('copy');
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy to Clipboard';
          }, 2000);
        };

        modal.setTitle('Export HTML');
        modal.setContent(container);

        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`;

        textarea.value = fullHtml;
        container.appendChild(textarea);
        container.appendChild(copyBtn);
        modal.open();
      }
    });
    
    // Import command - Enhanced to handle full HTML documents
    cmdm.add('import-template', {
      run: (editor: any) => {
        const modal = editor.Modal;
        const container = document.createElement('div');
        const textarea = document.createElement('textarea');
        const importBtn = document.createElement('button');
        
        // Style container
        container.style.cssText = `
          padding: 20px;
          background: white;
          border-radius: 8px;
        `;
        
        // Style textarea
        textarea.style.cssText = `
          width: 100%;
          height: 400px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.4;
          resize: vertical;
          box-sizing: border-box;
          margin-bottom: 12px;
        `;
        textarea.placeholder = 'Paste your HTML code here (full document or just body content)...';
        
        // Style import button
        importBtn.innerHTML = 'Import';
        importBtn.style.cssText = `
          background: #FFC107;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        `;
        
        importBtn.onclick = () => {
          let code = textarea.value.trim();
          
          // Check if it's a full HTML document
          if (code.toLowerCase().includes('<!doctype') || code.toLowerCase().includes('<html')) {
            // Extract body content
            const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch && bodyMatch[1]) {
              code = bodyMatch[1].trim();
            } else {
              // Try to extract anything between <body> tags
              const simpleBodyMatch = code.match(/<body>([\s\S]*?)<\/body>/i);
              if (simpleBodyMatch && simpleBodyMatch[1]) {
                code = simpleBodyMatch[1].trim();
              }
            }
            
            // Also extract and apply CSS if present
            const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            if (styleMatch) {
              styleMatch.forEach((styleBlock: string) => {
                const cssContent = styleBlock.replace(/<\/?style[^>]*>/gi, '');
                // Note: GrapesJS newsletter preset uses inline styles, so external CSS may not apply fully
                console.log('Extracted CSS:', cssContent);
              });
            }
          }
          
          if (code) {
            editor.setComponents(code);
            modal.close();
          } else {
            alert('Please paste valid HTML content');
          }
        };
        
        modal.setTitle('Import HTML Template');
        container.appendChild(textarea);
        container.appendChild(importBtn);
        modal.setContent(container);
        modal.open();
      }
    });
  }

  /* ========================================
     Load Default Template
     ======================================== */
  private loadDefaultTemplate(): void {
    const defaultEmail = `
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f1f3f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:6px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px; text-align:center; border-bottom:1px solid #e9ecef;">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=60" alt="Brand" style="max-width:140px; height:auto; display:block; margin:0 auto 12px; border-radius:8px;">
                <h2 style="margin:0;font-size:20px;color:#111827;">Product Update — What's New</h2>
                <p style="margin:6px 0 0;color:#6b7280;font-size:14px;">A short intro about this month's update and highlights.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px;">
                <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&q=60" alt="Hero" style="width:100%; display:block; border-radius:6px;">
                <h3 style="font-size:18px;margin:14px 0 6px;color:#111827;">Meet the new Dashboard</h3>
                <p style="margin:0 0 12px;color:#6b7280;">Streamlined analytics, improved performance, and a refreshed visual design.</p>
                <div style="text-align:center;">
                  <a href="#" style="display:inline-block;padding:12px 22px;border-radius:6px;background:#2563eb;color:#fff;font-weight:600;text-decoration:none;">Explore the Dashboard ➜</a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td valign="top" style="width:50%; padding-right:8px;">
                      <img src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=60" alt="" style="width:100%; display:block; border-radius:6px;">
                      <h4 style="margin:12px 0 6px;font-size:16px;color:#111827;">Faster Load Times</h4>
                      <p style="margin:0;color:#6b7280;font-size:14px;">Significant improvements across critical pages.</p>
                    </td>
                    <td valign="top" style="width:50%; padding-left:8px;">
                      <img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=60" alt="" style="width:100%; display:block; border-radius:6px;">
                      <h4 style="margin:12px 0 6px;font-size:16px;color:#111827;">New Integrations</h4>
                      <p style="margin:0;color:#6b7280;font-size:14px;">Connect your tools with one click.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 28px;text-align:center;">
                <a href="#" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#10b981;color:#fff;font-weight:700;text-decoration:none;font-size:15px;">Get Started — It's Free</a>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px; border-top:1px solid #e9ecef; text-align:center; font-size:13px; color:#9ca3af;">
                <p style="margin:8px 0 0;">You are receiving this email because you signed up for updates from <strong>Acme Inc.</strong></p>
                <p style="margin:6px 0 0;">123 Business Rd, Business City, 12345</p>
                <p style="margin:6px 0 0;"><a href="#" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a> • <a href="#" style="color:#6b7280;text-decoration:underline;">Manage preferences</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `;

    this.editor.setComponents(defaultEmail);
  }

  /* ========================================
     Editor Ready Callback
     ======================================== */
  private onEditorReady(): void {
    this.editor.onReady(() => {
      console.log('GrapesJS Editor is ready');
      
      // Show borders by default
      const wrapper = this.editor.DomComponents.getWrapper();
      wrapper.set('style', { 
        ...wrapper.getStyle(),
        'outline': '1px solid #ddd'
      });
      
      // Setup device manager buttons
      setTimeout(() => {
        this.setupDeviceButtons();
        this.updateDeviceButtons();
      }, 100);
      
      // Wait for CKEDITOR load
      setTimeout(() => {
        if (typeof CKEDITOR !== 'undefined') {
          CKEDITOR.dtd.$editable.a = 1;
        }
      }, 200);
      
      // Auto-save on change
      this.editor.on('storage:start:store', () => {
        console.log('Saving template...');
      });
      
      this.editor.on('storage:end:store', () => {
        console.log('Template saved successfully');
      });
    });
  }

  /* ========================================
     Device Manager Setup
     ======================================== */
  private setupDeviceButtons(): void {
    const deviceManager = this.editor.DeviceManager;
    const deviceContainer = document.getElementById('device-manager');

    if (!deviceContainer) return;

    // Clear existing content
    deviceContainer.innerHTML = '';

    // Get all devices
    const devices = deviceManager.getDevices();

    // Create buttons for each device
    devices.forEach((device: any) => {
      const button = document.createElement('button');
      button.className = 'editor-btn device-btn';
      button.innerHTML = `
        <span class="material-icons">${this.getDeviceIcon(device.id)}</span>
        <span class="editor-btn-text">${device.name || device.id}</span>
      `;
      button.title = device.name || device.id;

      // Add click handler
      button.addEventListener('click', () => {
        deviceManager.select(device.id);
        this.updateDeviceButtons();
      });

      // Add active class if this is the current device
      if (deviceManager.getSelected() === device.id) {
        button.classList.add('active');
      }

      deviceContainer.appendChild(button);
    });

    // Listen for device changes using editor events
    this.editor.on('device:select', () => {
      this.updateDeviceButtons();
    });
  }

  private updateDeviceButtons(): void {
    const deviceManager = this.editor.DeviceManager;
    const deviceContainer = document.getElementById('device-manager');

    if (!deviceContainer) return;

    const buttons = deviceContainer.querySelectorAll('button');
    const devices = deviceManager.getDevices();
    const selectedDevice = deviceManager.getSelected();

    // Update each button with proper device information
    buttons.forEach((button, index) => {
      const device = devices[index];
      if (device) {
        // Update button text with device name if it's showing undefined
        const textSpan = button.querySelector('.editor-btn-text');
        if (textSpan && (!textSpan.textContent || textSpan.textContent === 'undefined')) {
          textSpan.textContent = device.name || device.id;
        }

        // Update active state
        if (device.id === selectedDevice) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      }
    });

    console.log('Updated device buttons:', {
      devices: devices.map((d: any) => ({ id: d.id, name: d.name })),
      selectedDevice,
      buttonCount: buttons.length
    });
  }

  private getDeviceIcon(deviceId: string): string {
    switch (deviceId) {
      case 'desktop':
        return 'computer';
      case 'tablet':
        return 'tablet_mac';
      case 'mobile':
        return 'smartphone';
      default:
        return 'devices';
    }
  }

  /* ========================================
     Panel Toggle Methods
     ======================================== */
  toggleLeftPanel(): void {
    this.leftPanelOpen = !this.leftPanelOpen;
  }

  toggleRightPanel(): void {
    this.rightPanelOpen = !this.rightPanelOpen;
  }

  setActiveTab(tab: 'style' | 'traits' | 'layers'): void {
    this.activeTab = tab;
  }

  /* ========================================
     Toolbar Button Actions
     ======================================== */
  saveTemplate(): void {
    if (this.editor) {
      this.editor.store();
      this.showNotification('Template saved successfully!');
    }
  }

  undo(): void {
    if (this.editor) {
      this.editor.runCommand('core:undo');
    }
  }

  redo(): void {
    if (this.editor) {
      this.editor.runCommand('core:redo');
    }
  }

  preview(): void {
    if (this.editor) {
      const cmdm = this.editor.Commands;
      if (cmdm.isActive('preview')) {
        cmdm.stop('preview');
      } else {
        cmdm.run('preview');
      }
    }
  }

  exportHTML(): void {
    if (this.editor) {
      this.editor.runCommand('export-template');
    }
  }

  importHTML(): void {
    if (this.editor) {
      this.editor.runCommand('import-template');
    }
  }

  loadSampleTemplate(): void {
    if (this.editor) {
      if (confirm('Load sample template? This will replace your current work.')) {
        this.loadDefaultTemplate();
        this.showNotification('Sample template loaded successfully!');
      }
    }
  }

  clearCanvas(): void {
    if (this.editor) {
      this.editor.runCommand('canvas-clear');
    }
  }

  toggleDevices(): void {
    if (this.editor) {
      const deviceManager = this.editor.DeviceManager;
      const devices = deviceManager.getDevices();
      const currentDevice = deviceManager.getSelected();
      
      // Cycle through devices
      const currentIndex = devices.findIndex((d: any) => d.id === currentDevice);
      const nextIndex = (currentIndex + 1) % devices.length;
      deviceManager.select(devices[nextIndex].id);
    }
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleComponentOutlines(): void {
    if (!this.editor) return;

    this.componentOutlinesVisible = !this.componentOutlinesVisible;
    const canvas = this.editor.Canvas.getCanvasView();

    if (this.componentOutlinesVisible) {
      // Show component outlines
      canvas.getWrapperEl().style.outline = '2px solid #FFC107';
      canvas.getWrapperEl().style.outlineOffset = '2px';

      // Add outlines to all components
      const components = this.editor.DomComponents.getComponents();
      components.forEach((component: any) => {
        const el = component.getEl();
        if (el) {
          el.style.outline = '1px solid #2196F3';
          el.style.outlineOffset = '1px';
        }
      });

      this.showNotification('Component outlines enabled');
    } else {
      // Hide component outlines
      canvas.getWrapperEl().style.outline = '';
      canvas.getWrapperEl().style.outlineOffset = '';

      // Remove outlines from all components
      const components = this.editor.DomComponents.getComponents();
      components.forEach((component: any) => {
        const el = component.getEl();
        if (el) {
          el.style.outline = '';
          el.style.outlineOffset = '';
        }
      });

      this.showNotification('Component outlines disabled');
    }
  }

  /* ========================================
     Utility Methods
     ======================================== */
  private showNotification(message: string): void {
    // Simple notification using browser alert
    // In production, you might want to use a proper notification library
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background-color: #FFC107;
      color: #212121;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Roboto, sans-serif;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /* ========================================
     Backend Integration Methods
     ======================================== */
  private loadTemplatesFromBackend(): void {
    this.templateService.getAllTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        console.log('Loaded templates from backend:', templates.length);
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.showNotification('⚠️ Backend not available. Working in offline mode.');
      }
    });
  }

  saveTemplateToBackend(): void {
    if (!this.editor) return;

    const templateName = prompt('Enter template name:', 'My Email Template');
    if (!templateName) return;

    const description = prompt('Enter template description (optional):', '');

    const html = this.editor.getHtml();
    const css = this.editor.getCss();
    
    // Get project data in serializable format
    const projectData = this.editor.getProjectData();

    // Convert styles array to object for backend compatibility
    const stylesObject = projectData.styles && Array.isArray(projectData.styles) 
      ? { rules: projectData.styles } 
      : (projectData.styles || {});

    const template: Template = {
      name: templateName,
      description: description || undefined,
      html: html,
      css: css,
      components: projectData.pages?.[0]?.frames?.[0]?.component || projectData,
      styles: stylesObject,
      status: 'draft'
    };

    console.log('Saving template to backend:', template);

    if (this.currentTemplateId) {
      // Update existing template
      this.templateService.updateTemplate(this.currentTemplateId, template).subscribe({
        next: (updated) => {
          this.showNotification('✅ Template updated successfully in backend!');
          console.log('Template updated:', updated);
        },
        error: (error) => {
          console.error('Error updating template:', error);
          console.error('Error details:', error.error);
          this.showNotification('❌ Failed to update template: ' + (error.error?.message || error.message));
        }
      });
    } else {
      // Create new template
      this.templateService.createTemplate(template).subscribe({
        next: (created) => {
          this.currentTemplateId = created.id || null;
          this.showNotification('✅ Template saved to backend successfully!');
          console.log('Template created:', created);
          this.loadTemplatesFromBackend();
        },
        error: (error) => {
          console.error('Error saving template:', error);
          console.error('Error details:', error.error);
          this.showNotification('❌ Failed to save template: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  loadTemplateFromBackend(templateId: string): void {
    this.templateService.getTemplate(templateId).subscribe({
      next: (template) => {
        if (this.editor) {
          this.editor.setComponents(template.html);
          this.editor.setStyle(template.css);
          this.currentTemplateId = template.id || null;
          this.showNotification('✅ Template loaded from backend!');
          console.log('Template loaded:', template);
        }
      },
      error: (error) => {
        console.error('Error loading template:', error);
        console.error('Error details:', error.error);
        this.showNotification('❌ Failed to load template: ' + (error.error?.message || error.message));
      }
    });
  }

  showTemplatesList(): void {
    if (this.templates.length === 0) {
      this.showNotification('⚠️ No templates found. Create your first template!');
      return;
    }

    const templateList = this.templates
      .map((t, i) => `${i + 1}. ${t.name} (${t.description || 'No description'})`)
      .join('\n');

    const selection = prompt(`Select a template to load:\n\n${templateList}\n\nEnter number:`);
    
    if (selection) {
      const index = parseInt(selection, 10) - 1;
      if (index >= 0 && index < this.templates.length) {
        const template = this.templates[index];
        if (template.id) {
          this.loadTemplateFromBackend(template.id);
        }
      } else {
        this.showNotification('❌ Invalid selection');
      }
    }
  }
}
