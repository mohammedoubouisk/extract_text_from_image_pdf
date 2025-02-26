
// import { RegionDto } from './../dto/regio.dto';
// import { Injectable } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
// import { createWorker, Rectangle } from 'tesseract.js';
// import * as pdfParse from 'pdf-parse';
// import { PDFExtract, PDFExtractOptions } from 'pdf-extract';
// import * as sharp from 'sharp';


// // Add NodeCanvasFactory implementation
// class NodeCanvasFactory {
//   create(width: number, height: number) {
//     const canvas = document.createElement('canvas');
//     canvas.width = width;
//     canvas.height = height;
//     return canvas;
//   }
// }

// @Injectable()
// export class FileProcessorService {
//   private pdfExtract = new PDFExtract();

//   async processFile(file: Express.Multer.File, region?: RegionDto): Promise<string> {
//     const fileExt = path.extname(file.originalname).toLowerCase();
    
//     // Handle different file types
//     if (fileExt === '.pdf') {
//       return this.processPdf(file.path, region);
//     } else if (['.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.gif'].includes(fileExt)) {
//       return this.processImage(file.path, fileExt, region);
//     } else {
//       throw new Error(`Unsupported file format: ${fileExt}`);
//     }
//   }

//   private async processPdf(filePath: string, region?: RegionDto): Promise<string> {
//     try {
//       // First try to extract text directly from PDF (for PDFs with embedded text)
//       const pdfBuffer = fs.readFileSync(filePath);
//       const data = await pdfParse(pdfBuffer);
      
//       // If the PDF has meaningful text content, return it
//       if (data.text && data.text.trim().length > 20) {
//         return data.text;
//       }
      
//       // If the PDF doesn't have sufficient text, treat it as an image-based PDF
//       // Extract images from PDF and perform OCR
//       const result = await this.extractTextFromPdfImages(filePath, region);
//       return result;
//     } catch (error) {
//       throw new Error(`Failed to process PDF: ${error.message}`);
//     }
//   }

//   private async extractTextFromPdfImages(filePath: string, region?: RegionDto): Promise<string> {
//     // Extract pages as images
//     const options = { format: 'png', width: 2000 }; // High resolution for better OCR

//     // Fix the PDFExtractOptions to match what the library expects
//     const pdfExtractOptions: PDFExtractOptions = {};
    
//     try {
//       const pdfData = await this.pdfExtract.extract(filePath, pdfExtractOptions);
//       const tempDir = path.join(process.cwd(), 'temp');
      
//       // Ensure temp directory exists
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir);
//       }
      
//       let allText = '';
      
//       // Check if pdfData and pdfData.pages exist before processing
//       if (pdfData && pdfData.pages) {
//         // Process each page with OCR
//         for (let i = 0; i < pdfData.pages.length; i++) {
//           const pageImagePath = path.join(tempDir, `page_${i}.png`);
          
//           // Save page as image using pdf.js data
//           const page = pdfData.pages[i];
          
//           // Create an image from the page
//           await sharp({
//             create: {
//               width: page.width,
//               height: page.height,
//               channels: 4,
//               background: { r: 255, g: 255, b: 255, alpha: 1 }
//             }
//           })
//           .composite([
//             {
//               input: Buffer.from(page.content),
//               top: 0,
//               left: 0,
//             },
//           ])
//           .png()
//           .toFile(pageImagePath);
          
//           // Perform OCR on the page image
//           const pageText = await this.performOcr(pageImagePath, region);
//           allText += pageText + '\n\n';
          
//           // Clean up temporary file
//           fs.unlinkSync(pageImagePath);
//         }
//       } else {
//         throw new Error('PDF extraction returned no pages');
//       }
      
//       return allText.trim();
//     } catch (error) {
//       throw new Error(`Failed to extract text from PDF images: ${error.message}`);
//     }
//   }

//   private async processImage(filePath: string, fileExt: string, region?: RegionDto): Promise<string> {
//     try {
//       // For non-standard formats, convert to PNG first for better OCR results
//       if (!['.jpg', '.jpeg', '.png'].includes(fileExt)) {
//         const pngFilePath = filePath + '.png';
//         await sharp(filePath)
//           .png()
//           .toFile(pngFilePath);
        
//         const text = await this.performOcr(pngFilePath, region);
        
//         // Clean up temporary file
//         fs.unlinkSync(pngFilePath);
//         return text;
//       }
      
//       // For standard formats, perform OCR directly
//       return this.performOcr(filePath, region);
//     } catch (error) {
//       throw new Error(`Failed to process image: ${error.message}`);
//     }
//   }

//   private async performOcr(imagePath: string, region?: RegionDto): Promise<string> {
//     const worker = await createWorker();
    
//     try {
//       let recognizeResult;
      
//       if (region && region.left !== undefined && region.top !== undefined && 
//           region.width !== undefined && region.height !== undefined) {
//         const rectangle: Rectangle = {
//           left: region.left,
//           top: region.top,
//           width: region.width,
//           height: region.height
//         };
        
//         recognizeResult = await worker.recognize(imagePath, { rectangle });
//       } else {
//         recognizeResult = await worker.recognize(imagePath);
//       }

//       const { data: { text } } = recognizeResult;
//       return text;
//     } finally {
//       await worker.terminate();
//     }
//   }
// }