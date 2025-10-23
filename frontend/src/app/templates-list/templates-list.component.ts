import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemplateService, Template } from '../services/template.service';

@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.css']
})
export class TemplatesListComponent implements OnInit {
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);

  templates = signal<Template[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.error.set(null);

    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load templates');
        this.loading.set(false);
        console.error('Error loading templates:', err);
      }
    });
  }

  createNewTemplate(): void {
    this.router.navigate(['/editor']);
  }

  editTemplate(id: string): void {
    this.router.navigate(['/editor', id]);
  }

  duplicateTemplate(template: Template): void {
    if (!confirm(`Duplicate template "${template.name}"?`)) {
      return;
    }

    const duplicatedTemplate = {
      name: `${template.name} (Copy)`,
      description: template.description,
      html: template.html,
      css: template.css,
      components: template.components,
      styles: template.styles,
      assets: template.assets,
      status: 'draft'
    };

    this.templateService.createTemplate(duplicatedTemplate).subscribe({
      next: () => {
        this.loadTemplates();
      },
      error: (err) => {
        alert(`Failed to duplicate template: ${err.message}`);
      }
    });
  }

  deleteTemplate(id: string, name: string): void {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    this.templateService.deleteTemplate(id).subscribe({
      next: () => {
        this.loadTemplates();
      },
      error: (err) => {
        alert(`Failed to delete template: ${err.message}`);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'archived':
        return 'status-archived';
      default:
        return 'status-draft';
    }
  }
}
