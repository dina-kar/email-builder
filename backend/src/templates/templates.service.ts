import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    private s3Service: S3Service,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    try {
      const template = this.templateRepository.create(createTemplateDto);
      const savedTemplate = await this.templateRepository.save(template);
      this.logger.log(`Template created with ID: ${savedTemplate.id}`);
      return savedTemplate;
    } catch (error) {
      this.logger.error(`Failed to create template: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Template[]> {
    try {
      return await this.templateRepository.find({
        order: { updatedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch templates: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Template> {
    try {
      const template = await this.templateRepository.findOne({ where: { id } });
      if (!template) {
        throw new NotFoundException(`Template with ID ${id} not found`);
      }
      return template;
    } catch (error) {
      this.logger.error(`Failed to fetch template: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    try {
      const template = await this.findOne(id);
      const updatedTemplate = Object.assign(template, updateTemplateDto);
      const savedTemplate = await this.templateRepository.save(updatedTemplate);
      this.logger.log(`Template updated with ID: ${id}`);
      return savedTemplate;
    } catch (error) {
      this.logger.error(`Failed to update template: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const template = await this.findOne(id);
      
      // Delete associated assets from S3
      if (template.assets && template.assets.length > 0) {
        await this.s3Service.deleteFiles(template.assets);
      }
      
      // Delete thumbnail from S3
      if (template.thumbnail) {
        await this.s3Service.deleteFile(template.thumbnail);
      }
      
      await this.templateRepository.remove(template);
      this.logger.log(`Template deleted with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete template: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadAsset(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    try {
      const result = await this.s3Service.uploadFile(file, 'assets');
      this.logger.log(`Asset uploaded: ${result.key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload asset: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadThumbnail(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    try {
      const result = await this.s3Service.uploadFile(file, 'thumbnails');
      this.logger.log(`Thumbnail uploaded: ${result.key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload thumbnail: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadBase64Image(base64Data: string): Promise<{ key: string; url: string }> {
    try {
      const result = await this.s3Service.uploadBase64Image(base64Data, 'images');
      this.logger.log(`Base64 image uploaded: ${result.key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload base64 image: ${error.message}`, error.stack);
      throw error;
    }
  }
}
