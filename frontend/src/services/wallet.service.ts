import api from './api';

export const walletService = {
  getBalance() {
    return api.get('/wallet');
  },

  getStats() {
    return api.get('/wallet/stats');
  },

  getTransactions(params?: { page?: number; limit?: number; type?: string }) {
    return api.get('/wallet/transactions', { params });
  },

  getLedger(params?: { page?: number; limit?: number }) {
    return api.get('/wallet/ledger', { params });
  },

  getPayouts(params?: { page?: number; limit?: number }) {
    return api.get('/wallet/payouts', { params });
  },

  withdraw(amount: number) {
    return api.post('/wallet/withdraw', { amount });
  },

  /** Nạp tiền vào ví qua API nội bộ */
  deposit(amount: number, description?: string) {
    return api.post('/wallet/deposit', { amount, description });
  },
};
