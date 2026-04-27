import "../../styles/home.css";
import { useEffect, useState } from "react";
import ProductCard from "../../components/layout/ProductCard";
export default function HomePage() {

  const [featured, setFeatured] = useState([]);
const [wides, setWides] = useState([]);
const [cheap, setCheap] = useState([]);

useEffect(() => {
  fetch("http://localhost:3000/lenses?sort=rating")
    .then(res => res.json())
    .then(res => setFeatured(res.data));

  fetch("http://localhost:3000/lenses?type=Wide")
    .then(res => res.json())
    .then(res => setWides(res.data));

  fetch("http://localhost:3000/lenses?sort=price_asc")
    .then(res => res.json())
    .then(res => setCheap(res.data));
}, []);
  return (
    <div>
<section className="hero">
  <div className="container hero-grid">
    <div className="hero-left">
      <h1>Thuê Camera & Lens Chuyên Nghiệp</h1>
      <p>
        Truy cập vào các thiết bị quay phim cao cấp từ các thương hiệu hàng đầu thế giới.
        Giải pháp cho các nhà sáng tạo nội dung và nhiếp ảnh gia.
      </p>

      <div className="hero-buttons">
        <button className="btn primary">📷 Khám phá Thiết bị</button>
        <button className="btn outline">Xem Thêm</button>
      </div>
    </div>

    <div className="hero-right">
      <div className="hero-box">
        <div className="hero-icon">📷</div>
        <p>Thiết bị Chuyên Nghiệp</p>
      </div>
    </div>
  </div>
</section>

<section className="featured">
  <div className="container">
    <div className="header">
      <h2>Thiết bị Nổi bật</h2>
      <p>Những camera và lens được yêu thích nhất trên LensLeaseVN</p>
    </div>

   <div className="product-grid">
  {featured?.map((item) => (
    <ProductCard key={item.id} item={item} />
  ))}
</div>

   <div className="header">
      <h2>Thiết bị góc rộng</h2>
      <p>Những camera và lens góc rộng trên LensLeaseVN</p>
    </div>
   <div className="product-grid">
  {wides?.map((item) => (
    <ProductCard key={item.id} item={item} />
  ))}
</div>

 <div className="header">
      <h2>Thiết bị giá rẻ</h2>
      <p>Những camera và lens giá rẻ trên LensLeaseVN</p>
    </div>
   <div className="product-grid">
  {cheap?.map((item) => (
    <ProductCard key={item.id} item={item} />
  ))}
</div>
    <div className="view-all">
      <button className="btn outline">Xem Tất cả Thiết bị</button>
    </div>
  </div>
</section>

<section className="why">
  <div className="container">
    <h2 className="center">Tại sao chọn LensLeaseVN?</h2>

    <div className="feature-grid">
      <div className="feature-item">
        <div className="icon">⚡</div>
        <h3>Giá Cạnh tranh</h3>
        <p>Giá thuê thiết bị chuyên nghiệp với chi phí thấp nhất.</p>
      </div>

      <div className="feature-item">
        <div className="icon">🛡️</div>
        <h3>An toàn & Bảo hiểm</h3>
        <p>Tất cả thiết bị được kiểm tra kỹ lưỡng.</p>
      </div>

      <div className="feature-item">
        <div className="icon">📷</div>
        <h3>Thiết bị Mới nhất</h3>
        <p>Luôn cập nhật thiết bị mới nhất.</p>
      </div>
    </div>
  </div>
</section>

    </div>
 
  );
}
