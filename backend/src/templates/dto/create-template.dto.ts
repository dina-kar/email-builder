import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  html: string;

  @IsString()
  css: string;

  @IsObject()
  @IsOptional()
  components?: any;

  @IsObject()
  @IsOptional()
  styles?: any;

  @IsArray()
  @IsOptional()
  assets?: string[];

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
