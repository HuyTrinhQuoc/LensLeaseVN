import Sidebar from './Component/Sidebar';
import OrderItem from './Component/OrderItem';
import Header from './Component/Header';
import HandoverForm from './Component/HandoverForm';

function App() {
  return (
    <div className="bg-surface-container-low min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-24 pb-12 px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Đơn thuê của tôi</h2>
              <p className="text-on-surface-variant font-medium">Quản lý các thiết bị kỹ thuật của bạn.</p>
            </div>
          </div>

          {/* List Section */}
          {/* <div className="space-y-6">
            <OrderItem 
              title="Sony Alpha A7 IV + 24-70mm GM"
              code="LL-94021-VN"
              dateRange="15 Th05 — 20 Th05, 2024"
              duration="5 ngày thuê"
              status="Đang thuê"
              imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCr4Wzm6DlzaPaPltjeEdBxG8_OxrXPzLblDd_vJuwEFk2OZmea0Z6MORmwvm8cBMfi3hSzDmwUBdm77N2B48F1_ovWBI3yo0lxrLpQYSGv58yKZLzF6JvLyCVXNkLTHI7l8ExGQtTNoZ1WN3aupNVx5dIlLfjcGkUFBKyCuadLsXWL9nwghC3SxxKVeXYL9_la4ok0cSvyKpDOah7aVJn3AyPsOO_tJYXaQAL6a0QvgRoVaufoPfS4XEHrlWaBQOZbqxSymkCm2MI"
            />
            
            <OrderItem 
              title="Canon EOS R5 (Body Only)"
              code="LL-93882-VN"
              dateRange="Hết hạn: 12 Th05, 2024"
              duration="Quá hạn 3 ngày"
              status="Quá hạn"
              imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBP-oR8imkp_p4qhEkVvZFSZ4qOLR5eq4MJMvU00c68wN1Or3ih-GevKPLo6YSEStNlw4l7hkjorSE2r6ZEltEeT9_0U3Qu3ECIu-n-3KsH358mEyHk2-Yu8ReZOyMvfSrbmNBg9EbVJjky6aw-5q6MEFrVMKGfcQ2W_ne7MG3st3wStmeOMHBSW4CvJsTHhbENFFFs0CLTa5Ps03ttP1jKNQ-79jYez5zfEUPG5yzDdx0g0bvY9uZ3TqwrbrbGAHIgzDEZSUaI6_0"
            />
             <OrderItem 
              title="Canon EOS R5 (Body Only)"
              code="LL-93882-VN"
              dateRange="Hết hạn: 12 Th05, 2024"
              duration="Quá hạn 3 ngày"
              status="Quá hạn"
              imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBP-oR8imkp_p4qhEkVvZFSZ4qOLR5eq4MJMvU00c68wN1Or3ih-GevKPLo6YSEStNlw4l7hkjorSE2r6ZEltEeT9_0U3Qu3ECIu-n-3KsH358mEyHk2-Yu8ReZOyMvfSrbmNBg9EbVJjky6aw-5q6MEFrVMKGfcQ2W_ne7MG3st3wStmeOMHBSW4CvJsTHhbENFFFs0CLTa5Ps03ttP1jKNQ-79jYez5zfEUPG5yzDdx0g0bvY9uZ3TqwrbrbGAHIgzDEZSUaI6_0"
            />
          </div> */}


          <HandoverForm />
        </div>
      </main>
    </div>
  );
}

export default App;