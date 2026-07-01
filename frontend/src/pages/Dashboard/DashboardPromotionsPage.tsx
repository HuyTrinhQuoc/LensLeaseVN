import { useEffect, useState } from 'react';
import { PromotionManager } from '../../components/promotion/PromotionManager';
import {
  promotionService,
  type ManagedPromotion,
  type PromotionLensOption,
  type PromotionUpsertPayload,
} from '../../services/promotion.service';

export default function DashboardPromotionsPage() {
  const [promotions, setPromotions] = useState<ManagedPromotion[]>([]);
  const [lenses, setLenses] = useState<PromotionLensOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [promotionResponse, lensResponse] = await Promise.all([
        promotionService.listOwnerManaged(),
        promotionService.listOwnerPromotionLenses(),
      ]);
      setPromotions(promotionResponse.data.data || []);
      setLenses(lensResponse.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (id: string | null, payload: PromotionUpsertPayload) => {
    setSaving(true);
    try {
      if (id) {
        await promotionService.updateOwnerManaged(id, payload);
      } else {
        await promotionService.createOwnerManaged(payload);
      }
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promotion: ManagedPromotion) => {
    await promotionService.updateOwnerManagedStatus(promotion.id, !promotion.is_active);
    await loadData();
  };

  return (
    <PromotionManager
      title="Voucher của tôi"
      subtitle="Tạo mã giảm giá cho chính thiết bị của bạn. Chỉ cần chọn lens áp dụng, đặt thời gian và bật hoặc tắt khi cần."
      promotions={promotions}
      loading={loading}
      saving={saving}
      lensOptions={lenses}
      submitLabel="Tạo voucher owner"
      onSubmit={handleSubmit}
      onToggle={handleToggle}
    />
  );
}