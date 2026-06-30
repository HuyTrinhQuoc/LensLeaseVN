import { useRef, useState, useEffect } from 'react';

interface SignatureCanvasProps {
  onSave: (base64Image: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export default function SignatureCanvas({ onSave, onClear, placeholder }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false); // Theo dõi xem đã có nét vẽ nào chưa

  // Hàm cấu hình nét vẽ tách riêng để gọi mỗi khi bắt đầu vẽ, tránh bị mất nét
  const initContext = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = '#2563eb'; // Nét vẽ màu xanh dương
    ctx.lineWidth = 4;           // Tăng độ dày lên 4 cho rõ ràng
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initContext(canvas);
    }
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = e.clientX;
    let clientY = e.clientY;

    // Hỗ trợ cả điện thoại
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Tính toán tọa độ chuẩn xác theo tỷ lệ thật của khung vẽ
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Khởi tạo lại ngữ cảnh vẽ để chắc chắn nét vẽ có màu
    const ctx = initContext(canvas);
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Xuất chuỗi Base64 ra ngoài form cha ngay khi vừa bỏ chuột ra
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onClear) onClear();
    onSave(''); // Xóa chữ ký ở form cha
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Khung viền chứa chữ ký */}
      <div className="border-2 border-dashed border-gray-400 rounded-xl overflow-hidden w-full bg-white">
        
        {/* Nút text hướng dẫn được đưa ra hẳn ngoài canvas, nằm ở đỉnh khung để không bao giờ che khuất chuột */}
        <div className="bg-gray-100 text-center py-1.5 text-[11px] text-gray-500 border-b select-none font-medium">
          {placeholder || "Hãy nhấn giữ chuột trái và vẽ chữ ký vào ô trắng bên dưới"}
        </div>

        <canvas
          ref={canvasRef}
          width={500} // Độ phân giải pixel chiều ngang cố định
          height={160} // Độ phân giải pixel chiều dọc cố định
          className="w-full h-40 block cursor-crosshair bg-white touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {hasDrawn && (
        <button
          type="button"
          onClick={clearCanvas}
          className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 underline cursor-pointer"
        >
          Xóa chữ ký để ký lại
        </button>
      )}
    </div>
  );
}