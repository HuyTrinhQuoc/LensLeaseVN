import React, { useState } from 'react';

const NewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');

  return (
    <div className="bg-white min-h-screen pb-24 font-sans antialiased text-[#1d1d1f]">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Page Header - Typography Modern & Clean */}
        <div className="mb-16 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1]">
            Tiêu điểm & <br />
            <span className="text-[#0b45b3]">Đánh giá thiết bị</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
            Khám phá những xu hướng công nghệ mới nhất, đánh giá chuyên sâu và các bài viết truyền cảm hứng từ cộng đồng nhiếp ảnh chuyên nghiệp.
          </p>
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Main Featured */}
          <div className="lg:col-span-8 relative group cursor-pointer overflow-hidden rounded-[40px] h-[500px] md:h-[600px] shadow-2xl bg-slate-100">
             <img 
               src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80" 
               alt="Sony A7R V" 
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-10 md:p-16 text-white w-full">
                <span className="bg-[#0b45b3] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] mb-6 inline-block shadow-lg">Đánh giá thiết bị</span>
                <h2 className="text-3xl md:text-5xl font-black mb-6 group-hover:text-blue-300 transition-colors leading-[1.1] tracking-tighter">
                  Sony A7R V: Bước tiến vĩ đại của công nghệ lấy nét AI
                </h2>
                <div className="flex flex-wrap items-center gap-8 text-[13px] text-slate-300 font-bold tracking-tight">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>12 Thg 10, 2023</span>
                  </div>
                  <div className="flex items-center gap-2 pl-6 border-l border-white/20">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>4.2k lượt xem</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Side Featured */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="relative group cursor-pointer overflow-hidden rounded-[40px] flex-1 min-h-[250px] shadow-xl bg-slate-100">
               <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80" alt="Film photography" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-10 text-white">
                  <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 inline-block">Mẹo nhiếp ảnh</span>
                  <h3 className="text-2xl font-black leading-tight group-hover:text-amber-200 transition-colors tracking-tighter">Kỹ thuật chụp ảnh Film trong kỷ nguyên số</h3>
               </div>
            </div>
            <div className="relative group cursor-pointer overflow-hidden rounded-[40px] flex-1 min-h-[250px] shadow-xl bg-slate-100">
               <img src="https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80" alt="Accessories" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-10 text-white">
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 inline-block">Phụ kiện</span>
                  <h3 className="text-2xl font-black leading-tight group-hover:text-blue-200 transition-colors tracking-tighter">Top 5 thẻ nhớ tốc độ cao cho quay phim 8K</h3>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Main Content List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Tin tức mới nhất</h3>
               <div className="hidden sm:flex gap-3 bg-slate-50 p-1.5 rounded-2xl">
                  {['Tất cả', 'Công nghệ', 'Đánh giá'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                        activeTab === tab 
                        ? 'bg-[#0b45b3] text-white shadow-lg shadow-blue-900/20' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
               {[
                 { tag: 'CÔNG NGHỆ MÁY ẢNH', time: '2 ngày trước', title: 'Nikon Z8: Khi "tiểu Z9" khẳng định vị thế trong phân khúc chuyên nghiệp', desc: 'Sở hữu sức mạnh gần như tương đương đàn anh Z9 nhưng trong một thân máy nhỏ gọn hơn đáng kể...', img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=800&q=80' },
                 { tag: 'ỐNG KÍNH', time: '5 ngày trước', title: 'Canon RF 85mm f/1.2L USM: Đỉnh cao của nhiếp ảnh chân dung', desc: 'Phân tích chi tiết độ sắc nét, bokeh và khả năng chống quang sai của ống kính chụp chân dung khao khát nhất...', img: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80' },
                 { tag: 'TIN CỘNG ĐỒNG', time: '1 tuần trước', title: 'Quy trình làm việc (Workflow) hậu kỳ ảnh thương mại tiêu chuẩn 2024', desc: 'Chia sẻ từ các nhiếp ảnh gia hàng đầu về cách quản lý file, phân loại màu sắc và xuất bản chuyên nghiệp...', img: 'https://fast.com.vn/wp-content/uploads/2024/04/Thiet-ke-ho-so-quy-trinh-lam-viec-Workflow.png' },
                 { tag: 'ĐÁNH GIÁ THIẾT BỊ', time: '2 tuần trước', title: 'DJI Mavic 3 Pro: 3 ống kính có thực sự cần thiết cho nhà quay phim?', desc: 'Đánh giá thực tế khả năng quay chụp từ 3 camera độc lập trên Mavic 3 Pro. Liệu việc nâng cấp này có xứng đáng...', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80' }
               ].map((post, idx) => (
                 <div key={idx} className="group cursor-pointer">
                    <div className="rounded-[32px] overflow-hidden aspect-[1.5] mb-8 shadow-sm border border-slate-50 bg-slate-100">
                       <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                       <span className="text-[#0b45b3] font-black">{post.tag}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span>{post.time}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4 leading-[1.4] group-hover:text-[#0b45b3] transition-colors tracking-tight">{post.title}</h4>
                    <p className="text-[15px] text-slate-500 leading-relaxed line-clamp-2 font-medium">{post.desc}</p>
                 </div>
               ))}
            </div>

            <div className="mt-20 text-center">
               <button className="px-14 py-4 bg-white border border-slate-200 rounded-[20px] font-black text-slate-800 hover:bg-slate-50 transition-all shadow-sm text-sm uppercase tracking-widest">
                  Tải thêm bài viết
               </button>
            </div>
          </div>

          {/* Sidebar - Cập nhật với các khung (Card) chuyên nghiệp */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Khối Tìm kiếm */}
              <div className="bg-[#f8f9fc] p-8 rounded-[32px] border border-slate-100 shadow-sm">
                 <h4 className="font-black text-slate-900 mb-6 tracking-tighter text-base uppercase">Tìm kiếm</h4>
                 <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Nhập từ khóa..." 
                      className="w-full bg-white border border-slate-200 rounded-2xl px-8 py-5 text-sm font-medium focus:outline-none focus:border-[#0b45b3] transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-6 top-4.5 text-slate-400 group-focus-within:text-[#0b45b3]">search</span>
                 </div>
              </div>

              {/* Khối Danh mục */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                 <h4 className="font-black text-slate-900 mb-8 uppercase tracking-tighter text-lg border-b border-slate-50 pb-4">Danh mục</h4>
                 <div className="space-y-5">
                    {[
                      { name: 'Công nghệ máy ảnh', count: 42 },
                      { name: 'Mẹo nhiếp ảnh', count: 18 },
                      { name: 'Tin cộng đồng', count: 27 },
                      { name: 'Đánh giá thiết bị', count: 56 },
                      { name: 'Hướng dẫn thuê đồ', count: 12 }
                    ].map((cat, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                         <span className="text-slate-700 font-bold text-base group-hover:text-[#0b45b3] transition">{cat.name}</span>
                         <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full group-hover:bg-[#0b45b3] group-hover:text-white transition-all">{cat.count}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Khối Xem nhiều nhất */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                 <h4 className="font-black text-slate-900 mb-10 uppercase tracking-tighter text-lg border-b border-slate-50 pb-4">Xem nhiều nhất</h4>
                 <div className="space-y-12 pt-6">
                    {[
                      { id: '01', title: 'Hướng dẫn kiểm tra ống kính cũ trước khi thuê chi tiết nhất', meta: '12 Thg 9, 2023 • 8.2k lượt xem' },
                      { id: '02', title: 'So sánh ngàm Sony E và Canon RF: Đâu là tương lai?', meta: '05 Thg 10, 2023 • 7.5k lượt xem' },
                      { id: '03', title: 'Gợi ý 5 Combo máy ảnh cho người mới bắt đầu nhận job sự kiện', meta: '22 Thg 9, 2023 • 6.3k lượt xem' }
                    ].map((item) => (
                      <div key={item.id} className="flex gap-10 group cursor-pointer relative">
                         <span className="text-7xl font-black text-slate-50 group-hover:text-blue-50 transition-colors absolute -left-6 -top-10 -z-10 leading-none">{item.id}</span>
                         <div className="relative z-10">
                            <h5 className="font-bold text-slate-800 text-[16px] leading-snug mb-3 group-hover:text-[#0b45b3] transition-colors tracking-tight">{item.title}</h5>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{item.meta}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Newsletter */}
              <div className="bg-[#0f172a] rounded-2xl p-12 text-white relative overflow-hidden shadow-2xl mx-2 border border-white/5">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-[#0b45b3] rounded-full blur-[90px] opacity-40"></div>
                 <div className="relative z-10 text-center">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/10 mx-auto backdrop-blur-sm">
                     <span className="material-symbols-outlined text-3xl text-blue-400">mail</span>
                   </div>
                   <h4 className="text-2xl font-black mb-4 tracking-tight">Đăng ký nhận tin</h4>
                   <p className="text-slate-400 text-base mb-10 leading-relaxed font-medium">Nhận thông báo về thiết bị mới và các bài viết chuyên sâu hàng tuần.</p>
                   <div className="space-y-5">
                     <input 
                       type="email" 
                       placeholder="Email của bạn..." 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-[#0b45b3] transition-all placeholder:text-slate-600"
                     />
                     <button className="w-full bg-[#0b45b3] hover:bg-blue-600 transition-all py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20">
                        Đăng ký ngay
                     </button>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
