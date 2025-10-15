import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import grapesjs from 'grapesjs';
import grapesjsPresetNewsletter from 'grapesjs-preset-newsletter';
import grapesjsPluginCkeditor from 'grapesjs-plugin-ckeditor';

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

  ngOnInit(): void {
    // Migrate old templates from GrapesJS to C1X storage key
    this.migrateOldTemplates();
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
    this.onEditorReady();
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
    
    // Import command
    cmdm.add('import-template', {
      run: (editor: any) => {
        const modal = editor.Modal;
        const codeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
        const container = document.createElement('div');
        const importBtn = document.createElement('button');
        
        importBtn.innerHTML = 'Import';
        importBtn.className = 'gjs-btn-prim';
        importBtn.style.marginTop = '10px';
        importBtn.onclick = () => {
          const code = codeViewer.getContent();
          editor.setComponents(code);
          modal.close();
        };
        
        codeViewer.set({
          codeName: 'htmlmixed',
          theme: 'hopscotch',
          readOnly: false
        });
        
        modal.setTitle('Import HTML');
        modal.setContent('');
        modal.setContent(container);
        
        codeViewer.init(container);
        container.appendChild(importBtn);
        modal.open();
      }
    });
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
      this.editor.runCommand('gjs-open-import-template');
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
}
