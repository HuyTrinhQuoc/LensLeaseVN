
import HandoverForm from '../../components/layout/HandoverForm';

export default function LenderOrdersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-2">Đơn thuê của tôi</h2>
          <p className="text-gray-500 font-medium">Quản lý các thiết bị kỹ thuật của bạn.</p>
        </div>
      </div>

      {/* Handover Form Component */}
      <HandoverForm />
    </div>
  );
}
