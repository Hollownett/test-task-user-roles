import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateUserRolesDto {
  @IsArray()
  @IsNotEmpty()
  roleIds: number[];
}