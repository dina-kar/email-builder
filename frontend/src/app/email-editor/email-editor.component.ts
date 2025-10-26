import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import grapesjs from 'grapesjs';
import juice from 'juice';
import { TemplateService, Template } from '../services/template.service';
import { environment } from '../../environments/environment';

import { ALL_EMAIL_BLOCKS, EMAIL_BLOCKS } from './email-blocks.config';

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
    // Remove Email Container block from the left panel; we'll load it by default
    const blocks = ALL_EMAIL_BLOCKS.filter(b => b.id !== 'email-container');

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
        blocks,
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
    
    // Add custom component types for columns
    this.addCustomComponentTypes();
    
    // Add selection event listener to auto-select column containers
    this.setupColumnSelection();

    // Default canvas content: Email Container when creating a new template
    this.editor.on('load', () => {
      if (!this.templateId) {
        const hasContent = this.editor.getComponents().length > 0;
        if (!hasContent) {
          const emailContainer = EMAIL_BLOCKS.find(b => b.id === 'email-container');
          if (emailContainer) {
            this.editor.setComponents(emailContainer.content);
          }
        }
      }
    });
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

  private addCustomComponentTypes(): void {
    const editor = this.editor;
    
    // Define custom flexible column layout component
    editor.DomComponents.addType('flexible-columns', {
      isComponent: (el: any) => {
        // Check for data-gjs-type OR data-column-count attribute
        return el.getAttribute?.('data-gjs-type') === 'flexible-columns' ||
               (el.tagName === 'DIV' && el.getAttribute?.('data-column-count'));
      },
      model: {
        defaults: {
          name: 'Flexible Columns',
          droppable: true,
          stylable: true,
          tagName: 'div',
          attributes: { 
            'data-gjs-type': 'flexible-columns',
            'data-column-count': '2',
            'data-column-align': 'top',
            'data-column-padding': '20',
            'data-bg-color': '',
            'data-column-spacing': '0'
          },
          traits: [
            {
              type: 'select',
              label: 'Number of Columns',
              name: 'data-column-count',
              options: [
                { id: '1', name: '1 Column' },
                { id: '2', name: '2 Columns' },
                { id: '3', name: '3 Columns' },
                { id: '4', name: '4 Columns' },
              ]
            },
            {
              type: 'select',
              label: 'Column Alignment',
              name: 'data-column-align',
              options: [
                { id: 'top', name: 'Top' },
                { id: 'middle', name: 'Middle' },
                { id: 'bottom', name: 'Bottom' },
              ]
            },
            {
              type: 'color',
              label: 'Background Color',
              name: 'data-bg-color',
            },
            {
              type: 'number',
              label: 'Column Padding (px)',
              name: 'data-column-padding',
              min: 0,
              max: 100,
            }
          ],
        },
        init() {
          // Listen to attribute changes on this component
          const model = this as any;
          let debounceTimer: any = null;
          
          model.on('change:attributes', () => {
            // Debounce to prevent excessive rebuilds
            if (debounceTimer) clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
              if (model.view && model.view.el && !model.get('rebuilding')) {
                model.trigger('custom:update');
              }
            }, 150);
          });
        }
      }
    });
    
    // Add class to individual column divs for easier identification
    editor.DomComponents.addType('email-column-div', {
      isComponent: (el: any) => {
        if (el.tagName === 'DIV') {
          const className = el.getAttribute('class') || '';
          const dataIndex = el.getAttribute('data-column-index');
          return className.includes('email-column') || dataIndex !== null;
        }
        return false;
      },
      model: {
        defaults: {
          name: 'Column',
          droppable: true,
          stylable: true,
          highlightable: true,
          attributes: { class: 'email-column', 'data-col-padding': '20', 'data-col-bg': '', 'data-col-valign': 'top' },
          traits: [
            {
              type: 'number',
              label: 'Padding (px)',
              name: 'data-col-padding',
              min: 0,
              max: 100,
            },
            {
              type: 'color',
              label: 'Background',
              name: 'data-col-bg',
            },
            {
              type: 'select',
              label: 'Vertical Align',
              name: 'data-col-valign',
              options: [
                { id: 'top', name: 'Top' },
                { id: 'middle', name: 'Middle' },
                { id: 'bottom', name: 'Bottom' },
              ],
            },
          ]
        },
        init() {
          // Listen to attribute changes on this column
          const model = this as any;
          let debounceTimer: any = null;
          
          model.on('change:attributes', () => {
            // Debounce to prevent excessive updates
            if (debounceTimer) clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
              if (model.view && model.view.el && !model.get('applying-attributes')) {
                model.trigger('custom:column-update');
              }
            }, 100);
          });
        }
      }
    });
    
    // Listen to updates for flexible-columns and individual column props
    editor.on('component:update', (component: any) => {
      const t = component.get('type');
      if (t === 'flexible-columns') {
        this.handleColumnUpdate(component);
      } else if (t === 'email-column-div') {
        this.applyEmailColumnAttributes(component);
      }
    });
    
    // Listen to trait changes via attribute changes
    editor.on('component:update:attributes', (component: any) => {
      const t = component.get('type');
      if (t === 'flexible-columns') {
        this.handleColumnUpdate(component);
      } else if (t === 'email-column-div') {
        this.applyEmailColumnAttributes(component);
      }
    });
    
    // Listen to custom events from component models
    editor.on('component:custom:update', (component: any) => {
      this.handleColumnUpdate(component);
    });
    
    editor.on('component:custom:column-update', (component: any) => {
      this.applyEmailColumnAttributes(component);
    });
  }
  
  private handleColumnUpdate(component: any): void {
    // Avoid unnecessary rebuilds/infinite loops
    if (component.get('rebuilding')) return;

    const attrs = component.getAttributes();
    const count = parseInt(attrs['data-column-count'] || '2');
    const valign = attrs['data-column-align'] || 'top';
    const bgColor = attrs['data-bg-color'] || '';
    const padding = parseInt(attrs['data-column-padding'] || '20');
    const fingerprint = `${count}|${valign}|${bgColor}|${padding}`;

    const currentCols = component.find('.email-column');
    if (component.get('lastColumnConfig') === fingerprint && currentCols.length === count) {
      return;
    }
    component.set('rebuilding', true);

    const maxWidth = 600;
    const columnWidth = Math.floor(maxWidth / count);
    
    // Preserve inner content per column index
    const preserved: Record<number, any[]> = {};
    currentCols.forEach((col: any) => {
      const idx = parseInt(col.getAttributes()['data-column-index'] || '0');
      const innerTable = col.find('table')[0];
      const innerTd = innerTable ? innerTable.find('td')[0] : null;
      const items = innerTd ? innerTd.components().map((c: any) => c.clone()) : [];
      preserved[idx] = items;
    });
    
    // Generate MSO columns for Outlook
    let msoColumns = '';
    for (let i = 0; i < count; i++) {
      const bgStyle = bgColor ? `background-color:${bgColor};` : '';
      msoColumns += `<td width="${columnWidth}" valign="${valign}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:${padding}px; ${bgStyle}"></td></tr>
  </table>
</td>`;
    }
    
    // Clear existing components
    component.components('');
    
    // Create the wrapper table
    const table = component.append({
      type: 'default',
      tagName: 'table',
      attributes: {
        role: 'presentation',
        width: '100%',
        cellpadding: '0',
        cellspacing: '0',
        border: '0'
      },
      selectable: false,
      hoverable: false,
      highlightable: false,
      layerable: false,
      droppable: false,
    })[0];
    
    const tr = table.append({ 
      tagName: 'tr',
      selectable: false,
      hoverable: false,
      highlightable: false,
      layerable: false,
      droppable: false,
    })[0];
    
    const td = tr.append({
      tagName: 'td',
      attributes: {
        align: 'center',
        style: 'padding:0 20px; font-size:0;'
      },
      selectable: false,
      hoverable: false,
      highlightable: false,
      layerable: false,
      droppable: false,
    })[0];
    
    // Add MSO conditional comment
    td.append({
      type: 'comment',
      content: `[if mso]>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr>${msoColumns}</tr>
      </table>
      <![endif]`
    });
    
    // Create column divs as proper GrapesJS components
    for (let i = 0; i < count; i++) {
      const bgStyle = bgColor ? `background-color:${bgColor};` : '';
      
      const columnDiv = td.append({
        type: 'email-column-div',
        tagName: 'div',
        name: `Column ${i + 1}`,
        attributes: {
          class: 'email-column',
          'data-column-index': i.toString(),
          'data-col-padding': padding.toString(),
          'data-col-bg': bgColor,
          'data-col-valign': valign,
          style: `display:inline-block; vertical-align:${valign}; width:100%; max-width:${columnWidth}px;`
        },
        droppable: false, // Don't drop directly on the column div
        selectable: true,
        hoverable: true,
        highlightable: true,
      })[0];
      
      const colTable = columnDiv.append({
        tagName: 'table',
        attributes: {
          role: 'presentation',
          width: '100%',
          cellpadding: '0',
          cellspacing: '0',
          border: '0'
        },
        selectable: false,
        hoverable: false,
        highlightable: false,
        layerable: false,
        droppable: false,
      })[0];
      
      const colTr = colTable.append({ 
        tagName: 'tr',
        selectable: false,
        hoverable: false,
        highlightable: false,
        layerable: false,
        droppable: false,
      })[0];
      
      const colTd = colTr.append({
        tagName: 'td',
        attributes: {
          style: `padding:${padding}px; ${bgStyle}`
        },
        name: 'Drop content here',
        droppable: true, // Only the inner TD accepts drops
        selectable: false, // Don't allow selecting the TD
        hoverable: false,
        highlightable: false,
        layerable: false,
      })[0];
      
      // Restore preserved content if available
      const prev = preserved[i] || [];
      prev.forEach((comp: any) => colTd.append(comp));
    }

    component.set('lastColumnConfig', fingerprint);
    component.unset('rebuilding');
  }

  private setupColumnSelection(): void {
    const editor = this.editor;
    
    // When a component is added to canvas (dropped from block)
    editor.on('block:drag:stop', (component: any) => {
      // Wait for the component to be fully added
      setTimeout(() => {
        if (component) {
          let toSelect = component;
          if (toSelect.get && toSelect.get('type') !== 'flexible-columns') {
            // If dropped inside flexible-columns, bubble up
            let p = toSelect.parent && toSelect.parent();
            while (p) {
              if (p.get && p.get('type') === 'flexible-columns') {
                toSelect = p;
                break;
              }
              p = p.parent && p.parent();
            }
          }
          if (toSelect && toSelect.get && toSelect.get('type') === 'flexible-columns') {
            editor.select(toSelect);
            return;
          }
        }

        // Fallback: pick the last flexible-columns in the canvas
        const wrapper = editor.getWrapper();
        const all = wrapper.find('*');
        const flexList = all.filter((c: any) => c.get('type') === 'flexible-columns');
        if (flexList.length) {
          editor.select(flexList[flexList.length - 1]);
          return;
        }

        // Legacy columns fallback: select first column inside a column container
        all.forEach((comp: any) => {
          const attrs = comp.getAttributes();
          const style = attrs.style || '';
          if (style.includes('font-size:0') || style.includes('font-size: 0')) {
            const columns = comp.find('div').filter((div: any) => {
              const divStyle = div.getAttributes().style || '';
              return divStyle.includes('display:inline-block') || divStyle.includes('display: inline-block');
            });
            if (columns.length > 0) {
              editor.select(columns[0]);
              columns.forEach((col: any) => {
                col.set({ name: 'Column', selectable: true, hoverable: true, highlightable: true });
              });
            }
          }
        });
      }, 200);
    });
    
    // Prevent auto-selecting text inside columns on first click
    // Also handle reselection of flexible-columns when clicking child elements
    editor.on('component:selected', (component: any) => {
      if (!component) return;
      
      const tagName = component.get('tagName');
      const componentType = component.get('type');
      
      // If a table/tr/td inside a column is selected, select the column div instead
      if (tagName === 'table' || tagName === 'tr' || tagName === 'td') {
        let parent = component.parent();
        
        // Find the email-column-div parent
        while (parent) {
          const parentType = parent.get('type');
          
          if (parentType === 'email-column-div') {
            setTimeout(() => {
              editor.select(parent);
            }, 10);
            return;
          }
          
          if (parentType === 'flexible-columns') {
            // If inside flexible-columns but not in a column-div, select the flexible-columns
            setTimeout(() => {
              editor.select(parent);
            }, 10);
            return;
          }
          
          parent = parent.parent();
        }
      }
      
      // Prefill column traits from inner TD styles when selecting a column
      if (componentType === 'email-column-div') {
        // Use a timeout to avoid blocking the UI
        setTimeout(() => {
          this.prefillEmailColumnTraits(component);
        }, 50);
      }

      // If a child element is selected, check if it's inside a flexible-columns component
      if (componentType !== 'flexible-columns') {
        let parent = component.parent();
        
        // Navigate up to find the flexible-columns parent
        while (parent) {
          const parentType = parent.get('type');
          
          if (parentType === 'flexible-columns') {
            // If the selected component is a table/tr/td (structural), select the flexible-columns
            if (tagName === 'table' || tagName === 'tr' || tagName === 'td') {
              setTimeout(() => {
                editor.select(parent);
              }, 10);
            }
            break;
          }
          parent = parent.parent();
        }
      }
    });
    
    // Listen for component additions to auto-select flexible-columns
    editor.on('component:add', (component: any) => {
      const componentType = component.get('type');
      
      // If a flexible-columns component is added, select it after a short delay
      if (componentType === 'flexible-columns') {
        setTimeout(() => {
          editor.select(component);
        }, 100);
      }
    });

    // Add custom CSS for better column highlighting
    editor.on('load', () => {
      const canvasDoc = editor.Canvas.getDocument();
      const style = canvasDoc.createElement('style');
      style.innerHTML = `
        .email-column {
          outline: 2px dashed transparent;
          transition: outline 0.2s;
        }
        .email-column:hover {
          outline-color: #F59E0B !important;
        }
        .gjs-selected .email-column {
          outline-color: #2563EB !important;
        }
      `;
      canvasDoc.head.appendChild(style);
    });
  }

  // Apply column trait attributes to inner TD styles
  private applyEmailColumnAttributes(columnDiv: any): void {
    // Prevent infinite loops
    if (columnDiv.get && columnDiv.get('applying-attributes')) return;
    
    const attrs = columnDiv.getAttributes?.() || {};
    const pad = attrs['data-col-padding'];
    const bg = attrs['data-col-bg'];
    const valign = attrs['data-col-valign'];

    const innerTable = columnDiv.find('table')[0];
    const innerTd = innerTable ? innerTable.find('td')[0] : null;
    if (!innerTd) return;

    // Set flag to prevent recursion
    if (columnDiv.set) columnDiv.set('applying-attributes', true);

    // Build style string preserving unknown styles
    const currentStyle = (innerTd.getAttributes?.().style || '') as string;
    const styleMap: Record<string, string> = {};
    currentStyle.split(';').forEach((kv) => {
      const [k, v] = kv.split(':').map(s => s && s.trim());
      if (k && v) styleMap[k] = v;
    });

    if (pad !== undefined && pad !== null && pad !== '') {
      styleMap['padding'] = `${parseInt(pad, 10) || 0}px`;
    }
    if (bg !== undefined && bg !== null && bg !== '') {
      styleMap['background-color'] = bg;
    }
    if (valign) {
      // Vertical-align belongs to the column DIV (inline-block) and MSO TDs; we set on DIV for live preview
      const divAttrs = columnDiv.getAttributes?.() || {};
      const divStyle = (divAttrs.style || '') as string;
      const divMap: Record<string, string> = {};
      divStyle.split(';').forEach((kv) => {
        const [k, v] = kv.split(':').map(s => s && s.trim());
        if (k && v) divMap[k] = v;
      });
      divMap['vertical-align'] = valign;
      const newDivStyle = Object.entries(divMap).map(([k, v]) => `${k}: ${v}`).join('; ');
      columnDiv.addAttributes({ style: newDivStyle }, { silent: true });
    }

    const newStyle = Object.entries(styleMap).map(([k, v]) => `${k}: ${v}`).join('; ');
    innerTd.addAttributes({ style: newStyle }, { silent: true });
    
    // Clear flag after a short delay
    setTimeout(() => {
      if (columnDiv.unset) columnDiv.unset('applying-attributes');
    }, 50);
  }

  // Read inner TD styles to prefill traits on selection
  private prefillEmailColumnTraits(columnDiv: any): void {
    const innerTable = columnDiv.find('table')[0];
    const innerTd = innerTable ? innerTable.find('td')[0] : null;
    if (!innerTd) return;

    const style = (innerTd.getAttributes?.().style || '') as string;
    const map: Record<string, string> = {};
    style.split(';').forEach((kv) => {
      const [k, v] = kv.split(':').map(s => s && s.trim());
      if (k && v) map[k] = v;
    });

    const padding = map['padding'];
    const bg = map['background-color'];

    const divAttrs = columnDiv.getAttributes?.() || {};
    const divStyle = (divAttrs.style || '') as string;
    const dmap: Record<string, string> = {};
    divStyle.split(';').forEach((kv) => {
      const [k, v] = kv.split(':').map(s => s && s.trim());
      if (k && v) dmap[k] = v;
    });
    const valign = dmap['vertical-align'] || '';

    const toSet: any = {};
    if (padding) {
      const num = parseInt(padding.replace('px','').trim(), 10);
      if (!isNaN(num)) toSet['data-col-padding'] = String(num);
    }
    if (bg) {
      toSet['data-col-bg'] = bg;
    }
    if (valign) {
      toSet['data-col-valign'] = valign;
    }
    if (Object.keys(toSet).length) {
      // Use silent option to prevent triggering change events
      columnDiv.addAttributes(toSet, { silent: true });
    }
  }

  private isColumnContainer(component: any): boolean {
    // Check if component contains multiple inline-block divs (columns)
    const html = component.toHTML?.() || '';
    const styleAttr = component.getAttributes?.()?.style || '';
    
    return (
      html.includes('display:inline-block') || 
      html.includes('display: inline-block') ||
      styleAttr.includes('font-size:0') || // Common pattern for column containers
      styleAttr.includes('font-size: 0')
    );
  }

  private isInsideColumn(component: any): boolean {
    // Check if component is a text/paragraph inside a column structure
    let parent = component.parent?.();
    while (parent) {
      const parentStyle = parent.getAttributes?.()?.style || '';
      if (parentStyle.includes('display:inline-block') || 
          parentStyle.includes('display: inline-block')) {
        return true;
      }
      parent = parent.parent?.();
    }
    return false;
  }

  private findColumnParent(component: any): any {
    // Find the column div parent
    let parent = component.parent?.();
    while (parent) {
      const parentStyle = parent.getAttributes?.()?.style || '';
      const parentTag = parent.get?.('tagName') || '';
      
      if (parentTag.toLowerCase() === 'div' && 
          (parentStyle.includes('display:inline-block') || 
           parentStyle.includes('display: inline-block'))) {
        return parent;
      }
      parent = parent.parent?.();
    }
    return null;
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
