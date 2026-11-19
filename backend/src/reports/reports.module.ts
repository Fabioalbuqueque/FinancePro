import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { FamiliesModule } from '../families/families.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TransactionsModule, FamiliesModule, UsersModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
