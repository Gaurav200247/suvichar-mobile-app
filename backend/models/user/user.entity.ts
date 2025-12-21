import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ACCOUNT_TYPE {
  BUSINESS = 'business',
  PERSONAL = 'personal',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, default: 'Your Name' })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profileImageUrl?: string;

  @Column({ type: 'enum', enum: ACCOUNT_TYPE, default: ACCOUNT_TYPE.PERSONAL })
  accountType: ACCOUNT_TYPE;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
