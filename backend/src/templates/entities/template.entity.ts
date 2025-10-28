import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  mjml: string; // MJML source code

  @Column({ type: 'text', nullable: true })
  html: string;

  @Column({ type: 'text', nullable: true })
  css: string;

  @Column({ type: 'jsonb', nullable: true })
  components: any;

  @Column({ type: 'jsonb', nullable: true })
  styles: any;

  @Column({ type: 'jsonb', nullable: true })
  assets: string[];

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
