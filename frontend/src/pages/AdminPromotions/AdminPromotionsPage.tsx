import { useEffect, useState } from 'react';
import { PromotionManager } from '../../components/promotion/PromotionManager';
import {
  promotionService,
  type ManagedPromotion,
  type PromotionUpsertPayload,
} from '../../services/promotion.service';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<ManagedPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionService.listAdminManaged();
      setPromotions(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPromotions();
  }, []);

  const handleSubmit = async (id: string | null, payload: PromotionUpsertPayload) => {
    setSaving(true);
    try {
      if (id) {
        await promotionService.updateAdminManaged(id, payload);
      } else {
        await promotionService.createAdminManaged(payload);
      }
      await loadPromotions();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promotion: ManagedPromotion) => {
    await promotionService.updateAdminManagedStatus(promotion.id, !promotion.is_active);
    await loadPromotions();
  };

  return (
    <PromotionManager
      title="Voucher admin"
      subtitle="Tạo voucher nền tảng và theo dõi luôn cả voucher do owner phát hành. Giữ luồng đơn giản: tạo, sửa, bật tắt."
      promotions={promotions}
      loading={loading}
      saving={saving}
      submitLabel="Tạo voucher nền tảng"
      onSubmit={handleSubmit}
      onToggle={handleToggle}
    />
  );
}