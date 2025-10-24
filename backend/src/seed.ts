import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TemplatesService } from './templates/templates.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const templatesService = app.get(TemplatesService);

  const sampleTemplates = [
    {
      name: 'Welcome Email',
      description: 'A simple welcome email template',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome!</h1>
          <p>Thank you for joining us. We're excited to have you here.</p>
          <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
        </div>
      `,
      css: `
        body { margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 20px; border-radius: 8px; }
      `,
      components: {},
      styles: {},
      assets: [],
      status: 'published',
      metadata: { category: 'welcome' },
    },
    {
      name: 'Newsletter Template',
      description: 'Monthly newsletter layout',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>Monthly Newsletter</h1>
          </header>
          <section style="padding: 20px;">
            <h2>What's New</h2>
            <p>Check out our latest updates and features.</p>
            <ul>
              <li>New feature announcement</li>
              <li>Customer success stories</li>
              <li>Upcoming events</li>
            </ul>
          </section>
          <footer style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p>&copy; 2025 Your Company. All rights reserved.</p>
          </footer>
        </div>
      `,
      css: `
        body { margin: 0; padding: 20px; background-color: #f4f4f4; }
        header { margin-bottom: 20px; }
        section { margin-bottom: 20px; }
        footer { border-top: 1px solid #dee2e6; }
      `,
      components: {},
      styles: {},
      assets: [],
      status: 'published',
      metadata: { category: 'newsletter' },
    },
  ];

  for (const templateData of sampleTemplates) {
    try {
      const template = await templatesService.create(templateData);
      console.log(`Seeded template: ${template.name} (ID: ${template.id})`);
    } catch (error) {
      console.error(`Failed to seed template ${templateData.name}:`, error.message);
    }
  }

  await app.close();
  console.log('Seeding completed!');
}

seed().catch(console.error);