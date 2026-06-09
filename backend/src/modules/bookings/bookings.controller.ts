import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, ExtendBookingDto, CheckoutGroupDto } from './dto';
import * as jwt from 'jsonwebtoken';

@ApiTags('Đặt thuê (Bookings)')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  private getUserId(headers: Record<string, string>): string {
    const token = headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập (Thiếu Token)');

    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'lenslease_super_secret_key') as any;
        return payload.userId;
      } catch (e) {
        throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
      }
    }
    return token;
  }

  // ═══════════════════════════════════════
  //  LỊCH & KHẢ DỤNG
  // ═══════════════════════════════════════

  @Get('lenses/:lensId/calendar')
  @ApiOperation({
    summary: 'Lấy lịch khả dụng theo tháng',
    description: 'Trả về trạng thái từng ngày trong tháng: AVAILABLE, PARTIAL, FULLY_BOOKED, BLOCKED.',
  })
  @ApiParam({ name: 'lensId', description: 'ID sản phẩm' })
  @ApiQuery({ name: 'month', description: 'Tháng (YYYY-MM)', example: '2026-06' })
  async getCalendar(
    @Param('lensId') lensId: string,
    @Query('month') month: string,
  ) {
    const calendar = await this.bookingsService.getCalendar(lensId, month);
    return { message: 'Lấy lịch thành công', data: calendar };
  }

  @Get('lenses/:lensId/check-availability')
  @ApiOperation({
    summary: 'Kiểm tra khả dụng',
    description: 'Kiểm tra sản phẩm có trống cho khoảng ngày & số lượng yêu cầu không.',
  })
  @ApiParam({ name: 'lensId', description: 'ID sản phẩm' })
  @ApiQuery({ name: 'start_date', example: '2026-06-01' })
  @ApiQuery({ name: 'end_date', example: '2026-06-05' })
  @ApiQuery({ name: 'quantity', example: 1 })
  async checkAvailability(
    @Param('lensId') lensId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('quantity') quantity: string,
  ) {
    const result = await this.bookingsService.checkAvailability(
      lensId, startDate, endDate, Number(quantity) || 1,
    );
    return { message: 'Kiểm tra khả dụng thành công', data: result };
  }

  // ═══════════════════════════════════════
  //  CRUD BOOKING
  // ═══════════════════════════════════════

  @Post()
  @ApiOperation({
    summary: 'Tạo yêu cầu thuê (Bước 1)',
    description: 'Người thuê gửi yêu cầu. Đơn sẽ ở trạng thái PENDING, chờ Owner duyệt.',
  })
  async create(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateBookingDto,
  ) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.createBooking(userId, dto);
    return { message: 'Đã gửi yêu cầu thuê thành công', data: booking };
  }

  @Post('checkout-group')
  @ApiOperation({
    summary: 'Checkout nhiều món (BookingGroup + nhiều booking PENDING)',
    description:
      'Tạo một booking_group và các đơn con liên kết. Tiền ví vẫn trừ khi owner xác nhận từng đơn. Có thể gửi cart_item_ids để xóa khỏi giỏ sau khi tạo đơn.',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async checkoutGroup(
    @Headers() headers: Record<string, string>,
    @Body() dto: CheckoutGroupDto,
  ) {
    const userId = this.getUserId(headers);
    const data = await this.bookingsService.checkoutGroup(userId, dto);
    return { message: 'Đã tạo nhóm đơn thuê thành công', data };
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách đơn thuê',
    description: 'Lấy danh sách đơn thuê theo vai trò (renter/owner) và trạng thái.',
  })
  @ApiQuery({ name: 'role', enum: ['renter', 'owner'], description: 'Vai trò: renter = đơn tôi thuê, owner = đơn cho thuê' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Headers() headers: Record<string, string>,
    @Query('role') role: 'renter' | 'owner',
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.bookingsService.findAll(
      userId, role || 'renter', status, Number(page) || 1, Number(limit) || 10,
    );
    return { message: 'Lấy danh sách đơn thuê thành công', ...result };
  }

  @Get('owner/stats')
  @ApiOperation({ summary: 'Thống kê cho chủ máy (Lender Dashboard)' })
  async getOwnerStats(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const stats = await this.bookingsService.getOwnerStats(userId);
    return { message: 'Lấy thống kê thành công', data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn thuê' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async findById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.findById(id, userId);
    return { message: 'Lấy chi tiết đơn thuê thành công', data: booking };
  }

  // ═══════════════════════════════════════
  //  QUY TRÌNH 7 BƯỚC
  // ═══════════════════════════════════════

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Bước 2: Owner duyệt → CONFIRMED' })
  async confirm(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.confirmBooking(id, userId);
    return { message: 'Đã duyệt yêu cầu thuê', data: booking };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Owner từ chối → REJECTED' })
  async reject(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.rejectBooking(id, userId);
    return { message: 'Đã từ chối yêu cầu thuê', data: booking };
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Bước 4: Giao máy → ACTIVE' })
  async activate(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.activateBooking(id, userId);
    return { message: 'Đã giao máy, đơn thuê bắt đầu', data: booking };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Bước 5-7: Trả máy + Kiểm tra + Hoàn cọc → COMPLETED' })
  async complete(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.completeBooking(id, userId);
    return { message: 'Đơn thuê hoàn tất, cọc đã được xử lý', data: booking };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn thuê' })
  async cancel(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.cancelBooking(id, userId);
    return { message: 'Đã hủy đơn thuê', data: booking };
  }

  // ═══════════════════════════════════════
  //  GIA HẠN
  // ═══════════════════════════════════════

  @Post(':id/extend')
  @ApiOperation({ summary: 'Yêu cầu gia hạn' })
  async requestExtend(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: ExtendBookingDto,
  ) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.requestExtension(id, userId, dto);
    return { message: 'Đã gửi yêu cầu gia hạn', data: booking };
  }

  @Patch(':id/extend/approve')
  @ApiOperation({ summary: 'Owner chấp nhận gia hạn' })
  async approveExtend(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.approveExtension(id, userId);
    return { message: 'Đã chấp nhận gia hạn', data: booking };
  }

  @Patch(':id/extend/reject')
  @ApiOperation({ summary: 'Owner từ chối gia hạn' })
  async rejectExtend(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.getUserId(headers);
    const booking = await this.bookingsService.rejectExtension(id, userId);
    return { message: 'Đã từ chối gia hạn', data: booking };
  }

  @Patch(':id/renter-return')
  async renterReturn(@Param('id') id: string) {
    return this.bookingsService.renterReturnDevice(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}
