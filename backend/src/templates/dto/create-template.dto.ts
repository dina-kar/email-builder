import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  mjml?: string; // MJML source code

  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  css?: string;

  @IsOptional()
  components?: any;

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

  @IsOptional()
  metadata?: any;
}
