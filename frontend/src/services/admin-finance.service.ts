import api from './api';

export type FinanceSummary = {
  system_wallet_balance: number;
  commission_collected_all_time: number;
  commission_collected_this_month: number;
  escrow_held: number;
  pending_payout_amount: number;
};

export type AdminPayoutRow = {
  id: string;
  owner_id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  bank_name?: string | null;
  bank_account?: string | null;
  bank_owner_name?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  owner?: { id: string; full_name: string; email: string };
};

export type AdminTransactionRow = {
  id: string;
  amount: number;
  type: string;
  status: string;
  description?: string | null;
  created_at: string;
  user?: { id: string; full_name: string; email: string };
  booking?: { id: string; status: string } | null;
};

export const adminFinanceService = {
  getSummary() {
    return api.get<{ data: FinanceSummary }>('/admin/finance/summary');
  },

  listPayouts(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<{ data: AdminPayoutRow[]; total: number }>('/admin/finance/payouts', {
      params,
    });
  },

  approvePayout(id: string, adminNote?: string) {
    return api.patch(`/admin/finance/payouts/${id}/approve`, {
      admin_note: adminNote,
    });
  },

  rejectPayout(id: string, rejectionReason: string) {
    return api.patch(`/admin/finance/payouts/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
  },

  getTransactions(params?: { page?: number; limit?: number }) {
    return api.get<{ data: AdminTransactionRow[] }>('/admin/finance/transactions', {
      params,
    });
  },
};
