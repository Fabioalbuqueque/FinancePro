import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { FamiliesModule } from '../families/families.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    AccountsModule,
    FamiliesModule,
    UsersModule,
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService, MongooseModule],
})
export class TransactionsModule {}
