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

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private initializeEditor(): void {
    // Set up GrapesJS editor with the Newsletter plugin
    this.editor = grapesjs.init({
      selectorManager: { componentFirst: true },
      height: '100%',
      storageManager: {
        type: 'local',
        options: {
          local: { key: 'gjsProjectNl' }
        }
      },
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
      container: '#gjs',
      fromElement: true,
      plugins: [grapesjsPresetNewsletter, grapesjsPluginCkeditor],
      pluginsOpts: {
        'grapesjs-preset-newsletter': {
          modalLabelImport: 'Paste all your code here below and click import',
          modalLabelExport: 'Copy the code and use it wherever you want',
          codeViewerTheme: 'material',
          importPlaceholder: '<table class="table"><tr><td class="cell">Hello world!</td></tr></table>',
          cellStyle: {
            'font-size': '12px',
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
            allowedContent: true, // Disable auto-formatting, class removing, etc.
            enterMode: 2, // CKEDITOR.ENTER_BR,
            extraPlugins: 'sharedspace,justify,colorbutton,panelbutton,font',
            toolbar: [
              { name: 'styles', items: ['Font', 'FontSize'] },
              ['Bold', 'Italic', 'Underline', 'Strike'],
              { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
              { name: 'links', items: ['Link', 'Unlink'] },
              { name: 'colors', items: ['TextColor', 'BGColor'] },
            ],
          }
        }
      }
    });

    console.log('GrapesJS Editor initialized:', this.editor);
    console.log('BlockManager:', this.editor.BlockManager);
    console.log('Blocks:', this.editor.BlockManager?.getAll());

    this.setupCommands();
    this.setupButtons();
    this.setupTooltips();
    this.onEditorReady();
  }

  private setupCommands(): void {
    const pnm = this.editor.Panels;
    const cmdm = this.editor.Commands;
    const md = this.editor.Modal;

    // Add info command
    const infoContainer = document.getElementById('info-panel');
    cmdm.add('open-info', {
      run: (editor: any, sender: any) => {
        const mdlClass = 'gjs-mdl-dialog-sm';
        sender.set('active', 0);
        const mdlDialog = document.querySelector('.gjs-mdl-dialog') as HTMLElement;
        mdlDialog.className += ' ' + mdlClass;
        if (infoContainer) {
          infoContainer.style.display = 'block';
        }
        md.open({
          title: 'About this demo',
          content: infoContainer,
        });
        md.getModel().once('change:open', () => {
          mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
        });
      }
    });

    // Update canvas-clear command
    cmdm.add('canvas-clear', () => {
      if (confirm('Are you sure to clean the canvas?')) {
        this.editor.runCommand('core:canvas-clear');
        setTimeout(() => { localStorage.clear(); }, 0);
      }
    });
  }

  private setupButtons(): void {
    const pnm = this.editor.Panels;
    const iconStyle = 'style="display: block; max-width: 22px"';

    // Add info button
    pnm.addButton('options', [{
      id: 'view-info',
      label: `<svg ${iconStyle} viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" />
      </svg>`,
      command: 'open-info',
      attributes: {
        'title': 'About',
        'data-tooltip-pos': 'bottom',
      },
    }]);

    // Beautify tooltips
    [
      ['sw-visibility', 'Show Borders'],
      ['preview', 'Preview'],
      ['fullscreen', 'Fullscreen'],
      ['export-template', 'Export'],
      ['undo', 'Undo'],
      ['redo', 'Redo'],
      ['gjs-open-import-template', 'Import'],
      ['gjs-toggle-images', 'Toggle images'],
      ['canvas-clear', 'Clear canvas']
    ].forEach((item) => {
      const btn = pnm.getButton('options', item[0]);
      if (btn) {
        btn.set('attributes', { title: item[1], 'data-tooltip-pos': 'bottom' });
      }
    });
  }

  private setupTooltips(): void {
    const titles = document.querySelectorAll('*[title]');
    for (let i = 0; i < titles.length; i++) {
      const el = titles[i] as HTMLElement;
      const title = el.getAttribute('title');
      const trimmedTitle = title ? title.trim() : '';
      if (!trimmedTitle) break;
      el.setAttribute('data-tooltip', trimmedTitle);
      el.setAttribute('title', '');
    }
  }

  private onEditorReady(): void {
    this.editor.onReady(() => {
      const pnm = this.editor.Panels;

      // Show borders by default
      const visibilityBtn = pnm.getButton('options', 'sw-visibility');
      if (visibilityBtn) {
        visibilityBtn.set('active', 1);
      }

      // Show logo with the version
      const logoCont = document.querySelector('.gjs-logo-cont');
      const versionEl = document.querySelector('.gjs-logo-version');
      if (versionEl) {
        versionEl.innerHTML = 'v' + grapesjs.version;
      }
      const logoPanel = document.querySelector('.gjs-pn-commands');
      if (logoPanel && logoCont) {
        logoPanel.appendChild(logoCont);
      }

      // Wait for CKEDITOR load
      setTimeout(() => {
        if (typeof CKEDITOR !== 'undefined') {
          CKEDITOR.dtd.$editable.a = 1;
        }
      }, 200);
    });
  }
}
