import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users') // Phân loại API này vào nhóm "Users" trên Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách Người dùng', description: 'Trả về mảng chứa tất cả người dùng trong Database (Gồm cả Chủ shop và Khách thuê).' })
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return {
      message: 'Lấy dữ liệu từ Database Supabase thành công!',
      count: users.length,
      data: users,
    };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Tạo tài khoản ảo (Dành cho Test)', description: 'Tự động chèn 1 người dùng ngẫu nhiên vào Supabase để test quyền Ghi.' })
  async seedUser() {
    const user = await this.usersService.createMockUser();
    return {
      message: 'Đã tạo Mock User thành công, Database ghi nhận Ok!',
      data: user,
    };
  }
}
