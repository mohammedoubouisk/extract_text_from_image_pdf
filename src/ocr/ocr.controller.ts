import { Body, Controller, HttpException, HttpStatus, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RegionDto } from './dto/regio.dto';
import { OcrResponseDto } from './dto/ocr.dto';
import * as fs from 'fs'
import * as path from 'path'

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|PDF)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() region?: RegionDto) {
    return this.ocrService.extractTextFromImage(file, region);
  }


  
  //multiple images upload 
  @Post('batch-upload')
  @UseInterceptors(
    FilesInterceptor('images', 10, { // Allow up to 10 files
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async batchUploadImages(@UploadedFiles() files: Express.Multer.File[], @Body() region?: RegionDto) {
    
    return this.ocrService.batchExtractTextFromImages(files, region);
  }

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
  FilesInterceptor('files', 10, { // Limite de 10 fichiers par requête, ajustez selon vos besoins
    storage: diskStorage({
      destination: './stockage',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
  @Query('language') language = 'ara+eng+fra',
): Promise<OcrResponseDto[]> {
  console.log(`Received ${files.length} files for processing`);
  // Traiter les fichiers en parallèle avec Promise.all
  return Promise.all(
    files.map(file => this.ocrService.extractTextFromImageAndPdf(file, language))
  );
}                   
}   