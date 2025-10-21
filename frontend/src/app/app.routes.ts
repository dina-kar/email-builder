import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./email-editor/email-editor.component').then(m => m.EmailEditorComponent)
  }
];
