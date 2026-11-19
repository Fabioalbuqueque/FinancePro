import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { FamiliesModule } from '../families/families.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    FamiliesModule,
    UsersModule,
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService, MongooseModule],
})
export class AccountsModule {}
