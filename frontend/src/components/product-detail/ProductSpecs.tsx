interface ProductSpecsProps {
  brand?: string;
  specs?: any; 
}

export default function ProductSpecs({ brand, specs }: ProductSpecsProps) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Thông số kỹ thuật chi tiết</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-gray-500">Thương hiệu</span>
          <span className="font-semibold text-gray-900">{brand || 'Chưa cập nhật'}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-gray-500">Độ phân giải</span>
          <span className="font-semibold text-gray-900">61.0 Megapixels</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-gray-500">Cảm biến</span>
          <span className="font-semibold text-gray-900">Full-Frame Exmor R BSI CMOS</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-gray-500">Quay Video</span>
          <span className="font-semibold text-gray-900">8K 24p / 4K 60p 10-Bit</span>
        </div>
      </div>
    </div>
  );
}