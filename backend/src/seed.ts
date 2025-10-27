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
      mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="28px" color="#333333" font-weight="bold" padding-bottom="10px">
          Welcome!
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="1.6" padding-bottom="20px">
          Thank you for joining us. We're excited to have you here.
        </mj-text>
        <mj-button background-color="#007bff" color="#ffffff" href="#" font-weight="bold">
          Get Started
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
      components: {},
      styles: {},
      assets: [],
      status: 'published',
      metadata: { category: 'welcome' },
    },
    {
      name: 'Newsletter Template',
      description: 'Monthly newsletter layout',
      mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#007bff" padding="20px">
      <mj-column>
        <mj-text font-size="32px" color="#ffffff" font-weight="bold" align="center">
          Monthly Newsletter
        </mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="24px" color="#333333" font-weight="bold" padding-bottom="10px">
          What's New
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="1.6" padding-bottom="15px">
          Check out our latest updates and features.
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="1.8">
          • New feature announcement<br/>
          • Customer success stories<br/>
          • Upcoming events
        </mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section background-color="#f8f9fa" padding="20px">
      <mj-column>
        <mj-text font-size="14px" color="#666666" align="center">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
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