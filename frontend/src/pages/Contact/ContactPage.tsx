
import React, { useState } from 'react';
import './contact.css';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="max-w-4xl mx-auto px-4">
          <h1>Liên hệ với chúng tôi</h1>
          <p>
            Bạn có câu hỏi, đóng góp ý kiến hoặc cần hỗ trợ kỹ thuật? 
            Đội ngũ LensLease luôn sẵn sàng đồng hành cùng bạn 24/7.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="contact-container">
        
        {/* Left Side: Contact Info */}
        <aside className="contact-info-card">
          <div className="contact-info-item">
            <div className="contact-icon-box">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div className="contact-info-text">
              <h3>Văn phòng chính</h3>
              <p>Tầng 6, Tòa nhà Ladeco, 266 Đội Cấn, Quận Ba Đình, TP Hà Nội</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-icon-box">
              <span className="material-symbols-outlined">call</span>
            </div>
            <div className="contact-info-text">
              <h3>Hotline hỗ trợ</h3>
              <p>Mua hàng: 1900 6750</p>
              <p>Khiếu nại: 1900 6750</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-icon-box">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div className="contact-info-text">
              <h3>Email liên hệ</h3>
              <p>support@lenslease.vn</p>
              <p>info@lenslease.vn</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-icon-box">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="contact-info-text">
              <h3>Giờ làm việc</h3>
              <p>Thứ 2 - Thứ 6: 08:30 - 21:30</p>
              <p>Thứ 7 - CN: 09:00 - 18:00</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="social-connect">
            <p>Kết nối mạng xã hội</p>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </aside>

        {/* Right Side: Contact Form */}
        <main className="contact-form-card">
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group-row">
              <div className="form-field">
                <label htmlFor="name">Họ và tên của bạn</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Nguyễn Văn A" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">Địa chỉ Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@example.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="subject">Chủ đề cần hỗ trợ</label>
              <input 
                type="text" 
                id="subject" 
                placeholder="Ví dụ: Hỗ trợ thanh toán, Đăng tin..." 
                required 
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="message">Nội dung chi tiết</label>
              <textarea 
                id="message" 
                rows={5} 
                placeholder="Nhập nội dung bạn muốn gửi tới LensLease..." 
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="contact-submit-btn">
              <span>send</span>
              Gửi tin nhắn ngay
            </button>
          </form>
        </main>

      </div>
    </div>
  );
};

export default ContactPage;
