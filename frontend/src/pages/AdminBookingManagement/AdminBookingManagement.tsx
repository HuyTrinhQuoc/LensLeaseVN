import React from 'react';
import { useAdminBookings } from '../../hooks/useAdminBookings';
import { BookingFilters } from '../../components/AdminBookingManager/BookingFilters';
import { BookingDetailSidebar } from '../../components/AdminBookingManager/BookingDetailSidebar';
import { formatCurrency, formatDate, renderBookingStatusBadge } from '../../utils/bookingUtils';

const AdminBookingManagement: React.FC = () => {
  const {
    bookings, selectedBooking, isLoading,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    page, setPage, totalPages,
    setSelectedBooking, handleUpdateStatus
  } = useAdminBookings();

  return (
   <main className="flex-1 flex overflow-hidden w-full relative bg-background min-h-screen">
      <section className="flex-1 flex flex-col bg-surface-container-lowest min-w-0 md:min-w-[600px]">
        
        <BookingFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        />

        <div className="flex-1 overflow-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-8 text-center text-outline font-medium">Đang tải dữ liệu đơn thuê...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-md z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Mã đơn</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Người thuê</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Chủ máy</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Ngày thuê</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Tổng tiền</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`transition-colors cursor-pointer group hover:bg-surface-muted ${selectedBooking?.id === booking.id ? 'bg-primary/5' : 'bg-surface-container-lowest'}`}
                  >
                    <td className="px-6 py-4 font-mono text-base truncate max-w-150" title={booking.id}>
                      {booking.id.substring(0, 8)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-on-surface truncate max-w-150px">{booking.user?.full_name || 'N/A'}</span>
                        <span className="text-xs text-outline truncate max-w-150px">{booking.user?.phone}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-base font-bold text-on-surface truncate max-w-[150px]">{booking.owner?.full_name || 'N/A'}</span>
                        <span className="text-xs text-outline truncate max-w-[150px]">{booking.owner?.phone}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0 text-base">
                        <span className="text-on-surface">{formatDate(booking.start_date)}</span>
                        <span className="text-xs text-outline">Đến: {formatDate(booking.end_date)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-base font-bold text-primary whitespace-nowrap">
                      {formatCurrency(booking.total_price)}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap text-base">
                      {renderBookingStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-outline">Không tìm thấy đơn thuê nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination đơn giản */}
        <div className="p-4 border-t border-outline/10 flex justify-between items-center bg-surface">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-surface-container-high rounded-lg disabled:opacity-50 text-sm font-semibold"
          >
            Trang trước
          </button>
          <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
          <button 
            disabled={page === totalPages || totalPages === 0} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-surface-container-high rounded-lg disabled:opacity-50 text-sm font-semibold"
          >
            Trang sau
          </button>
        </div>
      </section>

      {selectedBooking && (
        <BookingDetailSidebar
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </main>
  );
};

export default AdminBookingManagement;