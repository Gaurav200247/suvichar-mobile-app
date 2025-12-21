import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, ACCOUNT_TYPE } from 'models/user';
import { Repository } from 'typeorm';
import { CustomLogger } from './common/services';

@Injectable()
export class BootstrapService {
  constructor(
    private readonly logger: CustomLogger,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    this.logger.log('Bootstrap service initialized');
    // Add any startup logic here if needed
  }
}
