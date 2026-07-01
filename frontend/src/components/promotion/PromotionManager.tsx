import { useState } from 'react';
import type {
  ManagedPromotion,
  PromotionLensOption,
  PromotionUpsertPayload,
} from '../../services/promotion.service';

type PromotionManagerProps = {
  title: string;
  subtitle: string;
  promotions: ManagedPromotion[];
  loading: boolean;
  saving: boolean;
  lensOptions?: PromotionLensOption[];
  submitLabel: string;
  onSubmit: (id: string | null, payload: PromotionUpsertPayload) => Promise<void>;
  onToggle: (promotion: ManagedPromotion) => Promise<void>;
};

type FormState = {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: string;
  min_order_value: string;
  max_discount_amount: string;
  start_date: string;
  end_date: string;
  usage_limit: string;
  is_active: boolean;
  applicable_lens_ids: string[];
};

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toLocalDateTimeInput(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function createDefaultFormState(): FormState {
  const now = new Date();
  return {
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_order_value: '',
    max_discount_amount: '',
    start_date: toLocalDateTimeInput(now),
    end_date: toLocalDateTimeInput(addDays(now, 7)),
    usage_limit: '',
    is_active: true,
    applicable_lens_ids: [],
  };
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return 'Khong gioi han';
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function PromotionManager({
  title,
  subtitle,
  promotions,
  loading,
  saving,
  lensOptions = [],
  submitLabel,
  onSubmit,
  onToggle,
}: PromotionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(createDefaultFormState);

  const hasLensSelection = lensOptions.length > 0;

  const resetForm = () => {
    setEditingId(null);
    setForm(createDefaultFormState());
  };

  const beginEdit = (promotion: ManagedPromotion) => {
    setEditingId(promotion.id);
    setMessage('');
    setError('');
    setForm({
      code: promotion.code,
      discount_type: promotion.discount_type,
      discount_value: String(promotion.discount_value),
      min_order_value: promotion.min_order_value != null ? String(promotion.min_order_value) : '',
      max_discount_amount:
        promotion.max_discount_amount != null ? String(promotion.max_discount_amount) : '',
      start_date: toLocalDateTimeInput(promotion.start_date),
      end_date: toLocalDateTimeInput(promotion.end_date),
      usage_limit: promotion.usage_limit != null ? String(promotion.usage_limit) : '',
      is_active: promotion.is_active,
      applicable_lens_ids: promotion.applicable_lenses.map((lens) => lens.id),
    });
  };

  const toggleLens = (lensId: string) => {
    setForm((current) => ({
      ...current,
      applicable_lens_ids: current.applicable_lens_ids.includes(lensId)
        ? current.applicable_lens_ids.filter((id) => id !== lensId)
        : [...current.applicable_lens_ids, lensId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const payload: PromotionUpsertPayload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        is_active: form.is_active,
      };

      if (form.min_order_value.trim()) {
        payload.min_order_value = Number(form.min_order_value);
      }
      if (form.max_discount_amount.trim()) {
        payload.max_discount_amount = Number(form.max_discount_amount);
      }
      if (form.usage_limit.trim()) {
        payload.usage_limit = Number(form.usage_limit);
      }
      if (hasLensSelection) {
        payload.applicable_lens_ids = form.applicable_lens_ids;
      }

      await onSubmit(editingId, payload);
      setMessage(editingId ? 'Đã cập nhật voucher.' : 'Đã tạo voucher mới.');
      resetForm();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || 'Không thể lưu voucher');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
            Tổng voucher: <strong className="text-slate-900">{promotions.length}</strong>
          </div>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Mã voucher
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none transition focus:border-[#0b45b3]"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              placeholder="SUMMER10"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Loại giảm
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.discount_type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discount_type: event.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                }))
              }
            >
              <option value="PERCENTAGE">Phần trăm</option>
              <option value="FIXED_AMOUNT">Số tiền cố định</option>
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Giá trị giảm
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.discount_value}
              onChange={(event) => setForm((current) => ({ ...current, discount_value: event.target.value }))}
              placeholder={form.discount_type === 'PERCENTAGE' ? '10' : '100000'}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Đơn tối thiểu
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.min_order_value}
              onChange={(event) => setForm((current) => ({ ...current, min_order_value: event.target.value }))}
              placeholder="500000"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Giảm tối đa
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.max_discount_amount}
              onChange={(event) => setForm((current) => ({ ...current, max_discount_amount: event.target.value }))}
              placeholder="200000"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Giới hạn lượt dùng
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.usage_limit}
              onChange={(event) => setForm((current) => ({ ...current, usage_limit: event.target.value }))}
              placeholder="100"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Bắt đầu
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.start_date}
              onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Kết thúc
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0b45b3]"
              value={form.end_date}
              onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
              required
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            Kích hoạt voucher ngay sau khi lưu
          </label>

          {hasLensSelection && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">Thiết bị áp dụng</h3>
                <p className="text-xs text-slate-500">Voucher owner phải gắn ít nhất một thiết bị của bạn.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {lensOptions.map((lens) => {
                  const checked = form.applicable_lens_ids.includes(lens.id);
                  return (
                    <label
                      key={lens.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        checked ? 'border-[#0b45b3] bg-blue-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleLens(lens.id)} />
                      <div>
                        <p className="font-semibold text-slate-900">{lens.title}</p>
                        <p className="text-xs text-slate-500">
                          {lens.approval_status} • {lens.available ? 'Đang mở thuê' : 'Đang tắt'} • {formatCurrency(lens.price_per_day)}/ngày
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {message && <p className="text-sm font-medium text-emerald-700 md:col-span-2">{message}</p>}
          {error && <p className="text-sm font-medium text-red-600 md:col-span-2">{error}</p>}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#0b45b3] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật voucher' : submitLabel}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Đang tải danh sách voucher...
          </div>
        ) : promotions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Chưa có voucher nào.
          </div>
        ) : (
          promotions.map((promotion) => (
            <article key={promotion.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold tracking-[0.2em] text-white">
                      {promotion.code}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        promotion.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {promotion.is_active ? 'Dang hoat dong' : 'Tam dung'}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {promotion.sponsor_type === 'PLATFORM' ? 'Nen tang' : 'Owner'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{promotion.description}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Hieu luc: {new Date(promotion.start_date).toLocaleString('vi-VN')} - {new Date(promotion.end_date).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>
                    Da dung: <strong className="text-slate-900">{promotion.used_count}</strong>
                  </p>
                  <p>
                    Gioi han: <strong className="text-slate-900">{promotion.usage_limit ?? 'Khong gioi han'}</strong>
                  </p>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  Gia tri giam: <strong className="text-slate-900">{promotion.discount_type === 'PERCENTAGE' ? `${promotion.discount_value}%` : formatCurrency(promotion.discount_value)}</strong>
                </p>
                <p>
                  Don toi thieu: <strong className="text-slate-900">{formatCurrency(promotion.min_order_value)}</strong>
                </p>
                <p>
                  Giam toi da: <strong className="text-slate-900">{formatCurrency(promotion.max_discount_amount)}</strong>
                </p>
                <p>
                  So lens ap dung: <strong className="text-slate-900">{promotion.applicable_lenses.length || 'Tat ca'}</strong>
                </p>
              </div>

              {promotion.creator && (
                <p className="mt-3 text-xs text-slate-500">
                  Nguoi tao: {promotion.creator.full_name || promotion.creator.email}
                </p>
              )}

              {promotion.applicable_lenses.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {promotion.applicable_lenses.map((lens) => (
                    <span key={lens.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {lens.title}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => beginEdit(promotion)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Chinh sua
                </button>
                <button
                  type="button"
                  onClick={() => void onToggle(promotion)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    promotion.is_active ? 'bg-slate-700' : 'bg-emerald-600'
                  }`}
                >
                  {promotion.is_active ? 'Tam dung' : 'Kich hoat'}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}