import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['roles'],
    });
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async updateRoles(
    id: number,
    updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const roles = await this.rolesRepository.findByIds(
      updateUserRolesDto.roleIds,
    );

    user.roles = roles;

    return await this.usersRepository.save(user);
  }
}
