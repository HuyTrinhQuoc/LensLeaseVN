export type OwnerBookingRow = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_price: number | string;
  booking_group_id?: string | null;
  booking_group?: {
    id: string;
    status: string;
    total_amount?: number | string;
    payment_method?: string;
  } | null;
  user?: { full_name?: string; avatar_url?: string; member_since?: string };
  items?: Array<{
    lens?: {
      id?: string;
      title?: string;
      thumbnail?: string;
      images?: Array<{ image_url?: string; url?: string }>;
    };
  }>;
};

export type OwnerOrderGroup = {
  kind: 'group';
  groupId: string;
  bookings: OwnerBookingRow[];
  booking_group?: OwnerBookingRow['booking_group'];
};

export type OwnerOrderSingle = {
  kind: 'single';
  booking: OwnerBookingRow;
};

export type OwnerOrderDisplay = OwnerOrderGroup | OwnerOrderSingle;

export function getBookingGroupId(b: OwnerBookingRow): string | null {
  return b.booking_group_id || b.booking_group?.id || null;
}

/** Gom các booking cùng booking_group_id trên trang hiện tại (giữ thứ tự API). */
export function groupOwnerBookings(bookings: OwnerBookingRow[]): OwnerOrderDisplay[] {
  const seen = new Set<string>();
  const result: OwnerOrderDisplay[] = [];

  for (const b of bookings) {
    const gid = getBookingGroupId(b);
    if (!gid) {
      result.push({ kind: 'single', booking: b });
      continue;
    }
    if (seen.has(gid)) continue;
    seen.add(gid);
    const members = bookings.filter((x) => getBookingGroupId(x) === gid);
    result.push({
      kind: 'group',
      groupId: gid,
      bookings: members,
      booking_group: b.booking_group,
    });
  }

  return result;
}

export function sumGroupPrice(bookings: OwnerBookingRow[]): number {
  return bookings.reduce((s, b) => s + Number(b.total_price || 0), 0);
}

export function shortOrderId(id: string): string {
  return id.replace(/-/g, '').slice(0, 5).toUpperCase();
}

export function lensThumb(b: OwnerBookingRow): string {
  const lens = b.items?.[0]?.lens;
  if (!lens) return 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Lens';
  if (lens.thumbnail) return lens.thumbnail;
  const img = lens.images?.[0];
  return img?.image_url || img?.url || 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Lens';
}

/** Ưu tiên trạng thái cần xử lý nhất trong nhóm. */
export function aggregateGroupStatus(bookings: OwnerBookingRow[]): string {
  const priority = ['PENDING', 'CONFIRMED', 'ACTIVE', 'OVERDUE', 'COMPLETED', 'CANCELLED', 'REJECTED'];
  for (const st of priority) {
    if (bookings.some((b) => b.status === st)) return st;
  }
  return bookings[0]?.status ?? 'PENDING';
}

export function primaryActionBooking(bookings: OwnerBookingRow[]): OwnerBookingRow {
  const priority = ['PENDING', 'CONFIRMED', 'ACTIVE'];
  for (const st of priority) {
    const hit = bookings.find((b) => b.status === st);
    if (hit) return hit;
  }
  return bookings[0];
}
