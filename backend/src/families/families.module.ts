import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Family, FamilySchema } from './schemas/family.schema';
import { FamilyMember, FamilyMemberSchema } from './schemas/family-member.schema';
import { Invitation, InvitationSchema } from './schemas/invitation.schema';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
      { name: Invitation.name, schema: InvitationSchema },
    ]),
    UsersModule,
  ],
  providers: [FamiliesService],
  controllers: [FamiliesController],
  exports: [FamiliesService, MongooseModule],
})
export class FamiliesModule {}
