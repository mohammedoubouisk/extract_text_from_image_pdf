import { OcrEntity } from './ocr.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createWorker, Rectangle, Worker } from 'tesseract.js';
import { OCRResultDto, RegionDto } from './dto/regio.dto';

import { OcrResponseDto } from './dto/ocr.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  constructor(
    @InjectRepository(OcrEntity)
    private ocrRepository: Repository<OcrEntity>,
  ) {}

  //extract text from one images
  async extractTextFromImage(file: Express.Multer.File, region?: RegionDto) {
    let worker: Worker | null = null;

    try {
      worker = await createWorker();

      // Perform OCR with or without region
      let recognizeResult;

      if (
        region &&
        region.left !== undefined &&
        region.top !== undefined &&
        region.width !== undefined &&
        region.height !== undefined
      ) {
        const rectangle: Rectangle = {
          left: region.left,
          top: region.top,
          width: region.width,
          height: region.height,
        };

        recognizeResult = await worker.recognize(file.path, { rectangle });
      } else {
        recognizeResult = await worker.recognize(file.path);
      }

      const {
        data: { text },
      } = recognizeResult;

      // Save to database
      const ocrResult = this.ocrRepository.create({
        extractedText: text,
        originalFileName: file.originalname,
        regionLeft: region?.left,
        regionTop: region?.top,
        regionWidth: region?.width,
        regionHeight: region?.height,
      });

      const savedResult = await this.ocrRepository.save(ocrResult);

      return {
        success: true,
        data: {
          id: savedResult.id,
          extractedText: savedResult.extractedText,
          fileName: savedResult.originalFileName,
          region: region
            ? {
                left: savedResult.regionLeft,
                top: savedResult.regionTop,
                width: savedResult.regionWidth,
                height: savedResult.regionHeight,
              }
            : null,
          createdAt: savedResult.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  //extract data from multipl images
  async batchExtractTextFromImages(
    files: Express.Multer.File[],
    region?: RegionDto,
  ) {
    // Create a single worker to process all files
    let worker: Worker | null = null;

    try {
      worker = await createWorker();
      const results: OCRResultDto[] = [];
      const errors: { fileName: string; error: string }[] = [];
      for (const file of files) {
        try {
          // this for region
          let recognizeResult;

          if (
            region &&
            region.left !== undefined &&
            region.top !== undefined &&
            region.width !== undefined &&
            region.height !== undefined
          ) {
            const rectangle: Rectangle = {
              left: region.left,
              top: region.top,
              width: region.width,
              height: region.height,
            };

            recognizeResult = await worker.recognize(file.path, { rectangle });
          } else {
            recognizeResult = await worker.recognize(file.path);
          }

          const {
            data: { text },
          } = recognizeResult;

          // Save to database
          const ocrResult = this.ocrRepository.create({
            extractedText: text,
            originalFileName: file.originalname,
            regionLeft: region?.left,
            regionTop: region?.top,
            regionWidth: region?.width,
            regionHeight: region?.height,
          });

          const savedResult = await this.ocrRepository.save(ocrResult);

          results.push({
            id: savedResult.id,
            extractedText: savedResult.extractedText,
            fileName: savedResult.originalFileName,
            region: region
              ? {
                  left: savedResult.regionLeft,
                  top: savedResult.regionTop,
                  width: savedResult.regionWidth,
                  height: savedResult.regionHeight,
                }
              : null,
            createdAt: savedResult.createdAt,
          });
        } catch (error) {
          errors.push({
            fileName: file.originalname,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        processedCount: results.length,
        failedCount: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  //extrat data from pdf and images also
  async extractTextFromImageAndPdf(
    file: Express.Multer.File,
    language = 'fra',
  ): Promise<OcrResponseDto> {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      let extractedText = '';
  
      if (fileExtension === '.pdf') {
        // Lire le fichier PDF
        const dataBuffer = await fs.readFile(file.path);
        
        // Extraire le texte avec pdf-parse
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else {
        // Extraction depuis image avec Tesseract
        const worker = await createWorker(language);
        const { data } = await worker.recognize(file.path);
        await worker.terminate();
        extractedText = data.text;
      }
  
      // Le reste du code reste identique
      const ocrEntity = new OcrEntity();
      ocrEntity.extractedText = extractedText;
      ocrEntity.originalFileName = file.originalname;
      
      const savedEntity = await this.ocrRepository.save(ocrEntity);
      
      const response = new OcrResponseDto();
      response.id = savedEntity.id;
      response.extractedText = savedEntity.extractedText;
      response.fileName = savedEntity.originalFileName;
      response.createdAt = savedEntity.createdAt;
  
      return response;
    } catch (error) {
      this.logger.error(`Erreur lors de l'extraction OCR: ${error.message}`);
      throw error;
    } 
  }
}
