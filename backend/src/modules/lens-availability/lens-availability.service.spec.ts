import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LensAvailabilityService } from './lens-availability.service';
import { PrismaService } from '../../prisma.service';

describe('LensAvailabilityService', () => {
  let service: LensAvailabilityService;
  const prismaMock = {
    lensListing: { findUnique: jest.fn() },
    booking: { findMany: jest.fn() },
    blockedDate: { findMany: jest.fn() },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LensAvailabilityService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(LensAvailabilityService);
  });

  describe('computeMaxBookedForDayRange', () => {
    const lensId = 'lens-1';
    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 3);

    it('cộng quantity booking overlap theo từng ngày, lấy max', () => {
      const overlapping = [
        {
          start_date: new Date(2026, 5, 1),
          end_date: new Date(2026, 5, 2),
          items: [{ lens_id: lensId, quantity: 2 }],
        },
        {
          start_date: new Date(2026, 5, 2),
          end_date: new Date(2026, 5, 3),
          items: [{ lens_id: lensId, quantity: 1 }],
        },
      ];
      const blocked: { start_date: Date; end_date: Date; blocked_quantity: number }[] = [];
      const max = service.computeMaxBookedForDayRange(
        overlapping,
        blocked,
        start,
        end,
        lensId,
      );
      expect(max).toBe(3);
    });

    it('cộng blocked_quantity vào ngày overlap', () => {
      const overlapping: {
        start_date: Date;
        end_date: Date;
        items: { lens_id: string; quantity: number }[];
      }[] = [];
      const blocked = [
        {
          start_date: new Date(2026, 5, 2),
          end_date: new Date(2026, 5, 2),
          blocked_quantity: 2,
        },
      ];
      const max = service.computeMaxBookedForDayRange(
        overlapping,
        blocked,
        start,
        end,
        lensId,
      );
      expect(max).toBe(2);
    });

    it('bỏ qua booking item lens khác', () => {
      const overlapping = [
        {
          start_date: new Date(2026, 5, 1),
          end_date: new Date(2026, 5, 5),
          items: [{ lens_id: 'other', quantity: 99 }],
        },
      ];
      const max = service.computeMaxBookedForDayRange(
        overlapping,
        [],
        start,
        end,
        lensId,
      );
      expect(max).toBe(0);
    });
  });

  describe('assertLensAvailable', () => {
    it('throw NotFound khi không có lens', async () => {
      (prismaMock.lensListing.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.assertLensAvailable(
          prismaMock,
          'missing',
          new Date(2026, 0, 1),
          new Date(2026, 0, 5),
          1,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throw Conflict khi maxBooked + quantity > lens.quantity', async () => {
      (prismaMock.lensListing.findUnique as jest.Mock).mockResolvedValue({ quantity: 2 });
      (prismaMock.booking.findMany as jest.Mock).mockResolvedValue([
        {
          start_date: new Date(2026, 0, 1),
          end_date: new Date(2026, 0, 10),
          items: [{ lens_id: 'x', quantity: 2 }],
        },
      ]);
      (prismaMock.blockedDate.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        service.assertLensAvailable(
          prismaMock,
          'x',
          new Date(2026, 0, 2),
          new Date(2026, 0, 3),
          1,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
