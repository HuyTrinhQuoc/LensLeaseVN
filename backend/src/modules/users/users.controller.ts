import { Controller, Get, Post, Patch, Body, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
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

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin User đang đăng nhập', description: 'Yêu cầu có header x-user-id' })
  async getMyProfile(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new HttpException('Missing x-user-id header', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.usersService.findById(userId);
    return {
      message: 'Lấy profile thành công',
      data: user,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin User đang đăng nhập', description: 'Yêu cầu có header x-user-id' })
  async updateMyProfile(@Headers('x-user-id') userId: string, @Body() body: any) {
    if (!userId) {
      throw new HttpException('Missing x-user-id header', HttpStatus.UNAUTHORIZED);
    }
    const updated = await this.usersService.updateProfile(userId, body);
    return {
      message: 'Cập nhật profile thành công',
      data: updated,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin User theo ID (Public Profile)' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      message: 'Lấy thông tin user thành công',
      data: user,
    };
  }
}
