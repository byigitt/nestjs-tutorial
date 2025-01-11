import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { UserEventsListener } from './listeners/user.listener';
import { QueueModule } from '../../common/queues/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    QueueModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserEventsListener],
  exports: [UsersService],
})
export class UsersModule {}
