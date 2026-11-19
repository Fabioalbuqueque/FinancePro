import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccountsModule } from '../accounts/accounts.module';
import { FamiliesModule } from '../families/families.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TransactionsModule, AccountsModule, FamiliesModule, UsersModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
