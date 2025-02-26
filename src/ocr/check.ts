//  async batchExtractTextFromImages(
//     files: Express.Multer.File[],
//     region?: RegionDto,
//   ) {
//     // Create a single worker to process all files
//     let worker: Worker | null = null;

//     try {
//       worker = await createWorker();
//       const results: OCRResultDto[] = [];
//       const errors: { fileName: string; error: string }[] = [];
//       for (const file of files) {
//         try {
//           // this for region
//           let recognizeResult;

//           if (
//             region &&
//             region.left !== undefined &&
//             region.top !== undefined &&
//             region.width !== undefined &&
//             region.height !== undefined
//           ) {
//             const rectangle: Rectangle = {
//               left: region.left,
//               top: region.top,
//               width: region.width,
//               height: region.height,
//             };

//             recognizeResult = await worker.recognize(file.path, { rectangle });
//           } else {
//             recognizeResult = await worker.recognize(file.path);
//           }

//           const {
//             data: { text },
//           } = recognizeResult;

//           // Save to database
//           const ocrResult = this.ocrRepository.create({
//             extractedText: text,
//             originalFileName: file.originalname,
//             regionLeft: region?.left,
//             regionTop: region?.top,
//             regionWidth: region?.width,
//             regionHeight: region?.height,
//           });

//           const savedResult = await this.ocrRepository.save(ocrResult);

//           results.push({
//             id: savedResult.id,
//             extractedText: savedResult.extractedText,
//             fileName: savedResult.originalFileName,
//             region: region
//               ? {
//                   left: savedResult.regionLeft,
//                   top: savedResult.regionTop,
//                   width: savedResult.regionWidth,
//                   height: savedResult.regionHeight,
//                 }
//               : null,
//             createdAt: savedResult.createdAt,
//           });
//         } catch (error) {
//           errors.push({
//             fileName: file.originalname,
//             error: error.message,
//           });
//         }
//       }

//       return {
//         success: true,
//         processedCount: results.length,
//         failedCount: errors.length,
//         results,
//         errors: errors.length > 0 ? errors : undefined,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.message,
//       };
//     } finally {
//       if (worker) {
//         await worker.terminate();
//       }
//     }
//   }