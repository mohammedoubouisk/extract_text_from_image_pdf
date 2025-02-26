import { OcrEntity } from './ocr.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

@Module({
  imports: [TypeOrmModule.forFeature([OcrEntity])],
  controllers: [OcrController],
  providers: [OcrService],
})
export class OcrModule {}