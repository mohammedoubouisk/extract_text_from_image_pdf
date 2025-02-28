import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
export class LocationDto {
  @IsString()
  @IsNotEmpty()
  site: string;

  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsNotEmpty()
  armoires: string;

  @IsString()
  @IsNotEmpty()
  etageres: string;
}

export class MetadataDto {
  @IsString()
  @IsNotEmpty()
  auteur: string;

  @IsNotEmpty()
  @IsNumber()
  duree_conservation_ans: number;
}

export class ClassificationDto {
  @IsString()
  @IsNotEmpty()
  serie: string;

  @IsString()
  @IsNotEmpty()
  dossier: string;

  @IsString()
  @IsNotEmpty()
  sous_dossier: string;

  @IsString()
  @IsNotEmpty()
  entite_source: string;
}
export class OcrResponseDto {
  id: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  file_url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description:string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  keywords: string[];

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  @IsNotEmpty()
  @IsNotEmpty()
  code_barre: string;

  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ValidateNested()
  @Type(() => ClassificationDto)
  classification: ClassificationDto;

  @IsEnum(['public', 'restreint', 'confidentiel'])
  @IsNotEmpty()
  access_restriction: 'public' | 'restreint' | 'confidentiel';

  createdAt?: Date;
}
