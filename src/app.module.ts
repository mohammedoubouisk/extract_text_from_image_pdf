import { OcrEntity } from './ocr/ocr.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcrModule } from './ocr/ocr.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'nestocr',
      entities: [OcrEntity],
      synchronize: true, // Set to false in production
    }),
    OcrModule,
  ],
})
export class AppModule {}