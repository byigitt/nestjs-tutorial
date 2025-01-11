import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from '../../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../modules/users/dto/update-user.dto';
import { User } from '../../modules/users/entities/user.entity';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'createUser' })
  async create(@Payload() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    return this.userService.create(createUserDto);
  }

  @MessagePattern({ cmd: 'findAllUsers' })
  async findAll(): Promise<User[]> {
    this.logger.log('Finding all users');
    return this.userService.findAll();
  }

  @MessagePattern({ cmd: 'findOneUser' })
  async findOne(@Payload() id: string): Promise<User> {
    this.logger.log(`Finding user with id: ${id}`);
    return this.userService.findOne(id);
  }

  @MessagePattern({ cmd: 'findUserByEmail' })
  async findByEmail(@Payload() email: string): Promise<User> {
    this.logger.log(`Finding user with email: ${email}`);
    return this.userService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'updateUser' })
  async update(
    @Payload()
    data: {
      id: string;
      updateUserDto: UpdateUserDto;
    },
  ): Promise<User> {
    this.logger.log(`Updating user with id: ${data.id}`);
    return this.userService.update(data.id, data.updateUserDto);
  }

  @MessagePattern({ cmd: 'removeUser' })
  async remove(@Payload() id: string): Promise<void> {
    this.logger.log(`Removing user with id: ${id}`);
    return this.userService.remove(id);
  }
}
