export default function ProductCard({ item }) {
  return (
    <div className="card">
      <div className="card-image">
        <img src={item.thumbnail || item.lens_images?.[0]?.image_url} />
        <div className="badge">{item.type}</div>
        <div className="price-tag">
          {item.price_per_day} VND/ngày
        </div>
      </div>

      <div className="card-body">
        <p className="brand">{item.brand}</p>
        <h3>{item.title}</h3>
        <p className="desc">{item.description}</p>

        <div className="rating">
          ⭐ {item.rating_avg} ({item.rating_count})
        </div>
      </div>
    </div>
  );
}