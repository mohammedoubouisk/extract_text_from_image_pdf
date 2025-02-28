import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('ocr_results')
export class OcrEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({type:"text"})
  title:string

  @Column()
  file_url: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  keywords: string[];

  @CreateDateColumn({type:"timestamp"})
  date_created: Date;

  @Column('json')
  location: {
    site: string;
    locale: string;
    armoires: string;
    etageres: string;
  };

  @Column({ unique: true })
  code_barre: string;

  @Column('json')
  metadata: {
    auteur: string;
    duree_conservation_ans: number;
  };

  @Column('json')
  classification: {
    serie: string;
    dossier: string;
    sous_dossier: string;
    entite_source: string;
  };

  @Column({
    type: 'enum',
    enum: ['public', 'restreint', 'confidentiel'],
    default: 'public'
  })
  access_restriction: string;


}