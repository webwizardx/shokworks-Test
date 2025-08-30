import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  #users: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      name: 'Regular User',
      email: 'user@example.com',
      role: UserRole.USER,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

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
  findOne(id: number): User {
    const user = this.#users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * This method creates a new user
   * @param createUserDto - The user object
   * @author Jonathan Alvarado
   * @returns The user object
   */
  create(createUserDto: CreateUserDto): User {
    const existingUser = this.#users.find((user) => user.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const newUser: User = {
      id: this.#users.length + 1,
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.#users.push(newUser);
    return newUser;
  }

  /**
   * This method updates a user
   * @param id - The id of the user
   * @param updateUserDto - The user object
   * @author Jonathan Alvarado
   * @returns The user object
   */
  update(id: number, updateUserDto: UpdateUserDto): User {
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

    const updatedUser = {
      ...this.#users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.#users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * This method removes a user
   * @param id - The id of the user
   * @author Jonathan Alvarado
   * @returns The user object
   */
  remove(id: number): User {
    const userIndex = this.#users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const [removedUser] = this.#users.splice(userIndex, 1);
    return removedUser;
  }
}
