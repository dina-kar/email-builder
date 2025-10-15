import { Routes } from '@angular/router';
import { EmailBuilderComponent } from './email-builder/email-builder.component';

export const routes: Routes = [
  {
    path: '',
    component: EmailBuilderComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

