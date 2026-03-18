import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minimum: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '张三', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'user', required: false, enum: ['user', 'admin'] })
  @IsString()
  @IsOptional()
  role?: 'user' | 'admin';
}
