import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { GlobalConfig } from 'src/config/global';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  #jwtSalt: number;

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly configService: ConfigService<GlobalConfig>,
  ) {
    this.#jwtSalt = this.configService.get('jwt.salt', { infer: true }) as number;
  }

  /**
   * This method finds all users
   * @author Jonathan Alvarado
   * @returns The list of users
   */
  async findAll(): Promise<User[]> {
    return this.userModel.scope('withoutPassword').findAll();
  }

  /**
   * This method finds a user by id
   * @param id - The id of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userModel.scope('withoutPassword').findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * This method finds a user by email
   * @param email - The email of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      raw: true,
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * This method creates a new user
   * @param createUserDto - The user object
   * @author Jonathan Alvarado
   * @returns The user object
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, this.#jwtSalt);

    return await this.userModel.scope('withoutPassword').create({ ...createUserDto });
  }

  /**
   * This method updates a user
   * @param id - The id of the user
   * @param updateUserDto - The user object
   * @author Jonathan Alvarado
   * @returns The user object
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.scope('withoutPassword').findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
      }
    }

    await user.update(updateUserDto);
    return user;
  }

  /**
   * This method removes a user
   * @param id - The id of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  async remove(id: number): Promise<User> {
    const user = await this.userModel.scope('withoutPassword').findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.destroy();
    return user;
  }
}
