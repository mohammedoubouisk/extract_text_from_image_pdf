import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class RegionDto {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  export class OCRResultDto {
    @IsNumber()
    id: number;
  
    @IsString()
    extractedText: string;
  
    @IsString()
    fileName: string;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => RegionDto)
    region: RegionDto | null;
  
    @IsDate()
    createdAt: Date;
  }