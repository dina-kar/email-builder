import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./templates-list/templates-list.component').then(m => m.TemplatesListComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('./email-editor/email-editor.component').then(m => m.EmailEditorComponent)
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./email-editor/email-editor.component').then(m => m.EmailEditorComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
