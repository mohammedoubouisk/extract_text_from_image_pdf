import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('ocr_results')
export class OcrEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  extractedText: string;

  @Column()
  originalFileName: string;
  @CreateDateColumn()
  createdAt: Date;

  // Add columns to store region information
  @Column({ nullable: true })
  regionLeft: number;

  @Column({ nullable: true })
  regionTop: number;

  @Column({ nullable: true })
  regionWidth: number;

  @Column({ nullable: true })
  regionHeight: number;


}