import React from 'react';

// 1. Định nghĩa kiểu dữ liệu cho bài đăng
interface Listing {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  ownerName: string;
  ownerAvatar: string;
  location: string;
  rentPrice: string;
  deviceValue: string;
  statusText: string;
}

// 2. Dữ liệu mẫu (Mock data)
const LISTINGS_DATA: Listing[] = [
  {
    id: '1',
    name: 'Sony Alpha A7 IV Body',
    category: 'Máy ảnh',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_3ARrBOpZpr5jtWtCuU82D4wr7lcYfLMVTL6AehnwbARuw8imxRCbKmNBP2s49Ur2TNJrXiWz_timh_6KrheTtxDXr1Gm7qeEkgQ-abOtE6jbrozSsoV7w3EMEAjaJ_luHlBi1XB9B-ijgrJbb-5CTlcHtdT9G7AM6NBrC-nk3Xd5p3FsMHr9wmAWEz_x4KDEpa-ZWxVlI-tf-LI_zPKvQkLemqaRM8vLtwS9yBVjgXW3KO0HDPJGGByVRLQ0oNh4FR43eNtgch0',
    ownerName: 'Nguyễn Văn A',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcM3IetnH1J-A4-OQW9zk7UL2RTnfGaFFgkF7Mml4vxztQTO8O_7TGiIDktnvGQbvcSH32EQYiuAKtGdLaIdmkAcEgoXp0TYO6T5YLBlIy2dcYGg-i7-phz6YMqp8W_AJerf0MIs75nhxO5tv9F2abdxNlHcYGY3XV85Gx38DcIHTm6MyTCvSANuZkdkOAQQSVPcLvpXnNny5RmuB_Asats6FFSGjhq2UKljrQS1etwznpW2meBlrLlyQPeHiD-1zweJsmsh0hpZY',
    location: 'TP. Hồ Chí Minh',
    rentPrice: '500.000 ₫',
    deviceValue: '55.000.000 ₫',
    statusText: 'Chờ duyệt'
  },
  {
    id: '2',
    name: 'DJI Mavic 3 Pro Cine Combo',
    category: 'Flycam',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPm7jhE31zzvsW0o5wYo60smCPHx2TPizphMC2K6YGOaHkjkT7beDGsg_jjOWeJXk4oJwRol9E7mDqZum2IGoGC35LYWh0v8uCZGJiOXvhcgzGGS3ffqelvTQTV1td3LppAgF33vVtth57IeYjdUJ5_13nDUBLYxQS7FFOAkb4AXFj40K2iRIAB3vLIgi5kGHKIyTe94poz2e0z4zpBLrgu6VM7u-SPLm1A3VD5kG9GrvKlUF95RC2R80kkvyQL_004KsP23YGpp0',
    ownerName: 'Trần Bình',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlH1cVwMNReaqmiMXPctMys5UI68EOP5JJz80AlkqPf7OUExSQ4ZSosR0DIp4Jx8v6BQ82j61qfvUYQzT4tZRr8Sh91u26Ii-ruBGFMQeRV-1l3u7nZwMlCAzt3Ca9q5t380SO-A0_I_-F-dT4fBmsV9FHCFHBse5osRLK3rfvMS0K_J-gn44QjLpZ4uhiw_3qiUgJFS71JNYnawhNaSe_qj-v8nLIJrwRcySpEXzKs0swGJpL4oJZZ_pcFZnk_AcRZQ-ZlPuUjrc',
    location: 'Hà Nội',
    rentPrice: '1.200.000 ₫',
    deviceValue: '110.000.000 ₫',
    statusText: 'Chờ duyệt'
  },
  {
    id: '3',
    name: 'Sony FE 24-70mm f/2.8 GM II',
    category: 'Ống kính',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChlN-ojJfd1DrO8vIVMA3OTkxMttQ0Rmed4mc0lf0SqXtZSBQ8GZlcGAdfLQZxTjSISzh72kH8BmvW3z16ntEaRrIsPeLYg_QKNn9A-fOo_gH-PM0-fj1_UKXySsjOaWarVoRD0vJI3293RVxIBU1JxDTH7wULQJHSfYUKjVBxFT-6djp9gVIVnwTPD0DnMxgNRdPlrAicTsIK_aq0eJMVvVQOwXBt7H5U_NH9WOcw3i8tXooZ4BSALLnATcocWyFwEA5FaM43vh4',
    ownerName: 'Lê Cường',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH-BOmYRZSadpif_5dAG8M43aOkf5M9HEvyjnxML05AXXhoig2CbHfdEp0NVz7i-6ej7jIXWHL6pxG9FLmaVuS7-YdqMXVbH6R9d624iGVTOTQWPShGdcYuBnxOGO2TfgMNsmw0i9tAoPBJ_rS0G7j2V98h1-gpvF-1ILS52hmaORjSvCXALaD_wQXjwE816oy0LmyPzYzZ2CvLjuV6mWIxFpkmogyDjK7ZCCTiEpSbVB_vq77RJpNWmQo_geKUPTvcS8iikTSo2U',
    location: 'Đà Nẵng',
    rentPrice: '400.000 ₫',
    deviceValue: '45.000.000 ₫',
    statusText: 'Chờ duyệt'
  }
];

export default function MainContent() {
  const handleReject = (id: string) => {
    console.log('Mở modal từ chối cho ID:', id);
    // Logic mở Modal ở đây
  };

  const handleApprove = (id: string) => {
    console.log('Duyệt bài cho ID:', id);
    // Logic duyệt bài ở đây
  };

  return (
    <main className="max-w-[1440px] mx-auto px-margin-page py-8 font-body-md text-on-surface">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          {/* Đã chỉnh sửa: Phóng to và in đậm tiêu đề */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-2">
            Duyệt Tin Đăng
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Danh sách thiết bị chờ được kiểm duyệt trước khi hiển thị trên hệ thống.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest text-primary hover:text-primary-container px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">category</span>
            Quản lý danh mục
          </button>
        </div>
      </div>

      {/* Filter / Tabs Bar */}
      <div className="flex flex-wrap items-center gap-4 pb-4 mb-8">
        <button className="font-label-md text-label-md px-4 py-2 text-primary border-b-2 border-primary">
          Chờ duyệt ({LISTINGS_DATA.length})
        </button>
        <button className="font-label-md text-label-md px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors">
          Đã duyệt
        </button>
        <button className="font-label-md text-label-md px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors">
          Đã từ chối
        </button>
        <div className="flex-grow"></div>
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest rounded-lg font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="Tìm kiếm tin đăng..."
            type="text"
          />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {LISTINGS_DATA.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow duration-300 flex flex-col h-full group"
          >
            {/* Image Thumbnail */}
            <div className="relative h-48 bg-surface-variant overflow-hidden">
              <img
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={item.imageUrl}
              />
              <div className="absolute top-3 left-3 bg-[#FFF3E0] text-[#E65100] px-2 py-1 rounded flex items-center gap-1 font-label-md text-label-md border border-[#FFE0B2]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E65100]"></div>
                {item.statusText}
              </div>
            </div>

            {/* Content info */}
            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">
                  {item.name}
                </h3>
                <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>

              {/* Owner info */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-surface-variant overflow-hidden">
                  <img
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    src={item.ownerAvatar}
                  />
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {item.ownerName}
                </span>
                <span className="text-surface-dim mx-1">•</span>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {item.location}
                </span>
              </div>

              {/* Price details */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-surface-container-low p-3 rounded-lg">
                <div>
                  <span className="font-label-md text-label-md text-on-surface-variant block mb-1">
                    Giá thuê / ngày
                  </span>
                  <span className="font-data-mono text-data-mono text-primary font-bold">
                    {item.rentPrice}
                  </span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-on-surface-variant block mb-1">
                    Giá trị thiết bị
                  </span>
                  <span className="font-data-mono text-data-mono text-on-surface">
                    {item.deviceValue}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                <button className="col-span-2 w-full py-2 bg-surface-container-lowest text-primary border border-primary hover:bg-surface-container-low rounded-lg font-label-md text-label-md transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Xem chi tiết
                </button>
                <button 
                  onClick={() => handleReject(item.id)}
                  className="w-full py-2 bg-surface-container-lowest text-error border border-error hover:bg-error-container rounded-lg font-label-md text-label-md transition-colors"
                >
                  Từ chối
                </button>
                <button 
                  onClick={() => handleApprove(item.id)}
                  className="w-full py-2 bg-primary text-on-primary hover:bg-[#004bb8] rounded-lg font-label-md text-label-md transition-colors shadow-sm"
                >
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}