import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white font-sans antialiased text-slate-900">
      {/* Hero Section */}
      <section className="relative h-[550px] md:h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Professional Camera"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/30"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-white">
          <span className="text-blue-400 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-6 block animate-fade-in">LensLease Vietnam</span>
          <h1 className="text-5xl md:text-8xl font-black leading-[1.1] mb-8 tracking-tighter max-w-4xl">
            Kết nối đam mê,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300">Chia sẻ công nghệ</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed font-medium">
            Nền tảng cho thuê thiết bị nhiếp ảnh chuyên nghiệp hàng đầu Việt Nam. Nơi những người sáng tạo gặp gỡ và chia sẻ công cụ để hiện thực hóa ý tưởng.
          </p>
          <div className="flex flex-wrap gap-5">
            <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-extrabold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl">
              Khám phá ngay
            </button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <span className="bg-amber-100 text-amber-900 px-4 py-1.5 rounded-lg text-xs font-black uppercase mb-8 inline-block tracking-wider">Sứ mệnh của chúng tôi</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 leading-[1.15] tracking-tight">
              Chúng tôi định nghĩa lại cách người sáng tạo tiếp cận thiết bị đỉnh cao.
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium">
              LensLease là nền tảng cho thuê thiết bị nhiếp ảnh P2P hàng đầu Việt Nam. Chúng tôi xây dựng một hệ sinh thái bền vững, nơi mọi thiết bị đều được tối ưu hóa giá trị, đồng thời hỗ trợ cộng đồng sáng tạo tiếp cận công nghệ một cách thông minh và tiết kiệm nhất.
            </p>
          </div>
        </div>
        <div className="absolute top-1/2 right-0 w-1/3 h-px bg-slate-100 -translate-y-1/2"></div>
      </section>

      {/* Core Values Section */}
      <section className="py-28 bg-slate-50">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl md:text-3xl font-black text-blue-900 mb-16 tracking-tight">Giá trị cốt lõi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">Tin cậy</h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Hệ thống Escrow thông minh và gói bảo hiểm thiết bị toàn diện, đảm bảo an toàn tuyệt đối cho cả người thuê và chủ máy.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">Chuyên nghiệp</h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Quy trình bàn giao và kiểm tra kỹ thuật số 100% minh bạch, giúp bạn an tâm tập trung hoàn toàn vào việc sáng tạo.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl">groups</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">Cộng đồng</h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Kết nối từ những người yêu nhiếp ảnh, sẵn lòng chia sẻ kinh nghiệm và kết nối những cơ hội nghề nghiệp mới.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-indigo-50/40 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-blue-900 mb-20 tracking-tighter">Quy trình tinh gọn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {[
              { id: 1, title: 'Tìm kiếm', desc: 'Khám phá hàng ngàn thiết bị từ cơ bản đến cao cấp nhất.', icon: 'search' },
              { id: 2, title: 'Đặt cọc', desc: 'Thanh toán an toàn qua cổng Escrow bảo mật tuyệt đối.', icon: 'payments' },
              { id: 3, title: 'Nhận máy', desc: 'Bàn giao nhanh chóng với biên bản kỹ thuật số minh bạch.', icon: 'photo_camera' },
              { id: 4, title: 'Sáng tạo', desc: 'Tận hưởng đam mê và tạo nên những tác phẩm xuất sắc.', icon: 'auto_awesome' },
            ].map((step) => (
              <div key={step.id} className="group">
                <div className="w-20 h-20 bg-[#0b45b3] text-white rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                  <span className="text-blue-600 mr-1.5 font-bold">{step.id}.</span> {step.title}
                </h4>
                <p className="text-slate-500 text-base leading-relaxed px-4 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
          {/* Decorative connector line */}
          <div className="hidden md:block absolute top-[215px] left-1/2 -translate-x-1/2 w-3/4 h-0.5 border-t-2 border-dashed border-blue-200 z-0"></div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Đội ngũ sáng lập</h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.12)] relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Minh Quân - Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-50 rounded-[40px] -z-10 rotate-12"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full -z-10 animate-pulse"></div>
            </div>

            <div className="lg:pl-10">
              <h3 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Minh Quân</h3>
              <p className="text-blue-600 font-extrabold mb-10 uppercase tracking-[0.25em] text-sm">Founder & CEO</p>
              
              <div className="relative mb-12">
                <span className="material-symbols-outlined text-7xl text-blue-50 absolute -top-10 -left-10 -z-10 select-none">
                  format_quote
                </span>
                <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-sans font-medium italic relative z-10">
                  "Nhiếp ảnh là ngôn ngữ chung để chúng ta kể những câu chuyện tuyệt vời. Với LensLease, tôi muốn phá bỏ rào cản về chi phí thiết bị, để bất kỳ ai có đam mê đều có thể biến tầm nhìn của họ thành hiện thực."
                </p>
              </div>

              <p className="text-lg text-slate-500 leading-relaxed font-medium border-l-4 border-blue-600 pl-8 bg-slate-50 py-4 rounded-r-xl">
                Hơn 10 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thương mại và công nghệ, Quân hiểu rõ những khó khăn của nghệ sĩ trẻ khi tiếp cận thiết bị chuyên nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 mb-12">
        <div className="container mx-auto px-6">
          <div className="bg-[#0b45b3] rounded-[60px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_80px_rgba(11,69,179,0.25)]">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             
             <div className="relative z-10">
               <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter">
                  Sẵn sàng để bắt đầu hành trình sáng tạo?
               </h2>
               <p className="text-xl md:text-2xl text-blue-100 mb-16 max-w-3xl mx-auto font-medium opacity-90">
                  Gia nhập cộng đồng LensLease ngay hôm nay và khám phá hàng ngàn thiết bị đỉnh cao từ những chủ máy uy tín nhất.
               </p>
               <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="bg-white text-[#0b45b3] px-12 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                     Đăng ký miễn phí
                  </button>
                  <button className="bg-blue-600 text-white border border-blue-400 px-12 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all duration-300">
                     Tìm hiểu thêm
                  </button>
               </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
