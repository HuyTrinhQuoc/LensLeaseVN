import { useCallback, useEffect, useMemo, useState } from 'react';
import { bookingService } from '../../services/booking.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * DashboardStatsPage — Trang "Thống kê" cho Chủ thiết bị
 */
export default function DashboardStatsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const yearOptions = useMemo(() => {
    const ys: number[] = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y -= 1) ys.push(y);
    return ys;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingService.getOwnerStats({ month, year });
      setStats(res.data.data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void load();
  }, [load]);

  function formatPrice(n: number) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
  }

  const COLORS = ['#1a3fc7', '#fcd34d', '#e2e8f0'];

  const periodLabel = stats?.period?.label ?? `Tháng ${month}, ${year}`;

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>;
  }

  if (!stats) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>Lỗi tải dữ liệu.</div>;
  }

  const pieData = [
    { name: 'Hoàn thành', value: stats.status_distribution?.completed || 0 },
    { name: 'Đang thuê', value: stats.status_distribution?.active || 0 },
    { name: 'Đã hủy', value: stats.status_distribution?.cancelled || 0 },
  ];
  
  const totalOrdersForPie = pieData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100%', padding: '0 0 40px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Kỳ báo cáo</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {periodLabel}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#64748b' }}>calendar_month</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ border: 'none', fontSize: 13, fontWeight: 600, color: '#334155', background: 'transparent', outline: 'none', cursor: 'pointer' }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ border: 'none', fontSize: 13, fontWeight: 600, color: '#334155', background: 'transparent', outline: 'none', cursor: 'pointer' }}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        
        {/* Card 1 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3fc7' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>payments</span>
            </div>
            {stats.revenue_mom_pct != null && (
              <div
                style={{
                  background: stats.revenue_mom_pct >= 0 ? '#e0e7ff' : '#fee2e2',
                  color: stats.revenue_mom_pct >= 0 ? '#1a3fc7' : '#dc2626',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {stats.revenue_mom_pct >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {stats.revenue_mom_pct >= 0 ? '+' : ''}
                {stats.revenue_mom_pct}%
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Doanh thu kỳ báo cáo</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatPrice(stats.total_revenue)}</div>
        </div>

        {/* Card 2 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>handshake</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Lượt thuê hoàn tất (kỳ)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.successful_rentals}</div>
        </div>

        {/* Card 3 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>inventory_2</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Tỷ lệ máy trống</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.vacancy_rate}%</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, lineHeight: 1.35 }}>
            Tin đăng đã duyệt và đang mở, chưa có đơn ACTIVE/CONFIRMED trong hôm nay.
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>star</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Đánh giá trung bình</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            {stats.rating_avg != null && stats.rating_avg !== ''
              ? Number(stats.rating_avg).toFixed(1)
              : '—'}{' '}
            <span style={{ fontSize: 16, color: '#94a3b8', fontWeight: 600 }}>/ 5.0</span>
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        
        {/* Line Chart */}
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Tăng trưởng doanh thu</h3>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 4 }}>
              <button style={{ padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>Tuần</button>
              <button style={{ padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#1a3fc7', background: '#fff', border: 'none', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}>Tháng</button>
              <button style={{ padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>Năm</button>
            </div>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenue_growth || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a3fc7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1a3fc7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  tickFormatter={(value) => `${value / 1000000}M`}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1a3fc7" 
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, fill: '#1a3fc7', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Trạng thái đơn hàng</h3>
          
          <div style={{ height: 200, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Tổng đơn</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{totalOrdersForPie}</div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pieData.map((item, idx) => {
              const percent = totalOrdersForPie > 0 ? Math.round((item.value / totalOrdersForPie) * 100) : 0;
              return (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx] }}></div>
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{percent}%</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Top thiết bị được thuê nhiều nhất</h3>
          <a href="#" style={{ fontSize: 13, color: '#1a3fc7', fontWeight: 600, textDecoration: 'none' }}>Xem tất cả</a>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>Thiết bị</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>Số lượt thuê</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>Doanh thu tạo ra</th>
            </tr>
          </thead>
          <tbody>
            {(stats.top_lenses || []).length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '28px 16px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                  Chưa có đơn hoàn tất — chưa có dữ liệu top thiết bị.
                </td>
              </tr>
            ) : (
              (stats.top_lenses || []).map((lens: any) => (
              <tr key={lens.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src={lens.thumbnail} alt={lens.title} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{lens.title}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{lens.category_name}</div>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: 16, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    {lens.rentals}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {formatPrice(lens.revenue)}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
