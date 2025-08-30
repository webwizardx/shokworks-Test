import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  #users: User[] = [];
  #jwtSalt: number;

  /**
   * This method finds all users
   * @author Jonathan Alvarado
   * @returns The list of users
   */
  findAll(): User[] {
    return this.#users;
  }

  /**
   * This method finds a user by id
   * @param id - The id of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  findOne(id: number): Omit<User, 'password'> {
    const user = this.#users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapUserToResponse(user);
  }

  /**
   * This method finds a user by email
   * @param email - The email of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  findOneByEmail(email: string): Omit<User, 'password'> {
    const user = this.#users.find((user) => user.email === email);
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
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = this.#users.find((user) => user.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, this.#jwtSalt);

    const newUser: User = {
      id: this.#users.length + 1,
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.#users.push(newUser);
    return this.mapUserToResponse(newUser);
  }

  /**
   * This method updates a user
   * @param id - The id of the user
   * @param updateUserDto - The user object
   * @author Jonathan Alvarado
   * @returns The user object
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const userIndex = this.#users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== this.#users[userIndex].email) {
      const existingUser = this.#users.find((user) => user.email === updateUserDto.email);
      if (existingUser) {
        throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, this.#jwtSalt);
    }

    const updatedUser = {
      ...this.#users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.#users[userIndex] = updatedUser;
    return this.mapUserToResponse(updatedUser);
  }

  /**
   * This method removes a user
   * @param id - The id of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  remove(id: number): Omit<User, 'password'> {
    const userIndex = this.#users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const [removedUser] = this.#users.splice(userIndex, 1);
    return this.mapUserToResponse(removedUser);
  }

  /**
   * This method maps a user to a response
   * @param user - The user object
   * @author Jonathan Alvarado
   * @returns The user object
   */
  mapUserToResponse(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
