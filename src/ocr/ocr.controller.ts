import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RegionDto } from './dto/regio.dto';
import { OcrResponseDto } from './dto/ocr.dto';
import * as fs from 'fs';
import * as path from 'path';
import { title } from 'process';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  // @Post('upload')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, callback) => {
  //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  //       },
  //     }),
  //     fileFilter: (req, file, callback) => {
  //       if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|PDF)$/)) {
  //         return callback(new Error('Only image files are allowed!'), false);
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )
  // async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() region?: RegionDto) {
  //   return this.ocrService.extractTextFromImage(file, region);
  // }

  // //multiple images upload
  // @Post('batch-upload')
  // @UseInterceptors(
  //   FilesInterceptor('images', 10, { // Allow up to 10 files
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, callback) => {
  //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  //       },
  //     }),
  //     fileFilter: (req, file, callback) => {
  //       if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //         return callback(new Error('Only image files are allowed!'), false);
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )
  // async batchUploadImages(@UploadedFiles() files: Express.Multer.File[], @Body() region?: RegionDto) {

  //   return this.ocrService.batchExtractTextFromImages(files, region);
  // }

  //read pdf supported

  // @Post('pdf')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({

  //       destination: './stock',
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = file.originalname.split('.').pop();
  //         cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       const allowedMimeTypes = [
  //         'image/jpeg',
  //         'image/png',
  //         'image/tiff',
  //         'application/pdf',
  //       ];
  //       if (allowedMimeTypes.includes(file.mimetype)) {
  //         cb(null, true);
  //       } else {
  //         cb(new Error('Format de fichier non supporté'), false);
  //       }
  //     },
  //   }),

  // )
  // async uploadFile(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Query('language') language = 'ara+eng+fra',
  // ): Promise<OcrResponseDto> {
  //   return this.ocrService.extractTextFromImageAndPdf(file, language);
  // }

  //multiple pdf and images
  // Dans votre contrôleur
  @Post('batch')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './stockage',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/tiff',
          'application/pdf',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Format de fichier non supporté'), false);
        }
      },
    }),
  )
  async uploadMultipleFiles(
    
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
    @Query('language') language = 'ara+eng+fra',
  ): Promise<OcrResponseDto[]> {
    // Validate that files were uploaded
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier n\'a été fourni');
    }
    
    try {
      // Parse the metadata arrays
      const titles = this.parseArrayField(body.titles);
      const keywords = this.parseArrayField(body.keywords).map(k => 
        typeof k === 'string' ? this.safeParseJSON(k, []) : k
      );
      const locations = this.parseArrayField(body.locations).map(l => 
        typeof l === 'string' ? this.safeParseJSON(l, {}) : l
      );
      const metadatas = this.parseArrayField(body.metadatas).map(m => 
        typeof m === 'string' ? this.safeParseJSON(m, {}) : m
      );
      const access_restrictions = this.parseArrayField(body.access_restrictions);
      const classifications = this.parseArrayField(body.classifications).map(c =>
        typeof c === 'string' ? this.safeParseJSON(c, {}) : c
      );
      const code_barres = this.parseArrayField(body.code_barres);
      const descriptions = this.parseArrayField(body.descriptions);
      
      // Process each file with its specific metadata
      return await Promise.all(
        files.map(async (file, index) => {
          // Create a specific DTO for this file
          const fileDto = new OcrResponseDto();
          
          // Assign metadata from arrays if available, or use global values as fallback
          fileDto.title = titles[index];
          fileDto.keywords = keywords[index] || this.safeParseJSON(body.keywords, []);
          fileDto.location = locations[index] || this.safeParseJSON(body.location, {});
          fileDto.metadata = metadatas[index] || this.safeParseJSON(body.metadata, {});
          fileDto.access_restriction = access_restrictions[index];
          fileDto.classification = classifications[index];
          fileDto.code_barre = code_barres[index] || body.code_barre;
          fileDto.description = descriptions[index] || body.description;
          
          // Process this file with its specific metadata
          return await this.ocrService.extractTextFromImageAndPdf(
            file,
            fileDto,
            language,
          );
        })
      );
    } catch (error) {
      // this.logger.error(`Error processing batch upload: ${error.message}`);
      throw new BadRequestException(`Error processing batch: ${error.message}`);
    }
  }
  
  // Helper method to parse array fields in the form data
  private parseArrayField(field: any): any[] {
    if (!field) return [];
    
    // If already an array, return it
    if (Array.isArray(field)) return field;
    
    // If it's a string that looks like JSON array, parse it
    if (typeof field === 'string' && field.trim().startsWith('[')) {
      try {
        return JSON.parse(field);
      } catch (e) {
        // If parsing fails, treat as a single item
        return [field];
      }
    }
    
    // Otherwise, treat as a single item
    return [field];
  }
  
  // Safe JSON parsing helper
  private safeParseJSON(data: any, defaultValue: any): any {
    if (!data) return defaultValue;
    
    // If it's already an object or array, return as is
    if (typeof data === 'object') return data;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      // this.logger.warn(`JSON parsing failed, using default value: ${error.message}`);
      return defaultValue;
    }
  }

}
