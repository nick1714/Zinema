<script setup>
/**
 * Component Footer cho toàn bộ ứng dụng
 * Hiển thị thông tin bản quyền và links liên quan
 */
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="cinema-footer">
    <!-- Gradient border phía trên footer -->
    <div class="footer-border"></div>
    
    <div class="container py-4">
      <div class="row">
        <!-- Thông tin công ty -->
        <div class="col-lg-4 mb-4 mb-lg-0">
          <div class="footer-brand">
            <i class="fas fa-film"></i>
            <span>ZINEMA</span>
        </div>
          
          <p class="footer-desc">
            Hệ thống quản lý rạp chiếu phim hiện đại và chuyên nghiệp. 
            Với nhiều tính năng phục vụ cho việc vận hành rạp phim một cách hiệu quả.
          </p>
          
          <div class="social-links">
            <a href="#" class="social-link">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>
        
        <!-- Links hữu ích -->
        <div class="col-lg-4 mb-4 mb-lg-0">
          <h4 class="footer-title">Liên kết nhanh</h4>
          
          <ul class="footer-links">
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Phim đang chiếu</a></li>
            <li><a href="#">Sự kiện</a></li>
            <li><a href="#">Khuyến mãi</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>
        
        <!-- Liên hệ -->
        <div class="col-lg-4">
          <h4 class="footer-title">Liên hệ</h4>
          
          <div class="contact-info">
            <div class="contact-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>123 Đường Nguyễn Văn Cừ, Q. Ninh Kiều, TP. Cần Thơ</span>
            </div>
            
            <div class="contact-item">
              <i class="fas fa-phone-alt"></i>
              <span>Hotline: (028) 3822 9999</span>
            </div>
            
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <span>info@cinemax.com</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="footer-bottom">
        <div class="copyright">
          &copy; {{ currentYear }} ZINEMA. Tất cả quyền được bảo lưu.
        </div>
        <div class="developer">
          Phát triển bởi Nhóm NhutDat
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Footer container */
.cinema-footer {
  background-color: var(--cinema-darker);
  color: var(--cinema-text-muted);
  position: relative;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Gradient border trên footer */
.footer-border {
  height: 2px;
  background: var(--cinema-gradient-gold);
  opacity: 0.7;
  box-shadow: 0 0 10px rgba(247, 197, 72, 0.5);
}

/* Logo footer */
.footer-brand {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--cinema-primary);
  margin-bottom: 1.5rem;
}

.footer-brand i {
  margin-right: 0.5rem;
}

/* Mô tả */
.footer-desc {
  color: var(--cinema-text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Tiêu đề các phần */
.footer-title {
  color: var(--cinema-primary);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background: var(--cinema-gradient-gold);
}

/* Links mạng xã hội */
.social-links {
  display: flex;
  gap: 10px;
  margin-top: 1.5rem;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--cinema-primary);
  transition: all 0.3s ease;
  font-size: 1rem;
}

.social-link:hover {
  background: var(--cinema-primary);
  color: var(--cinema-darker);
  transform: translateY(-3px);
}

/* Links nhanh */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: var(--cinema-text-muted);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 15px;
  display: inline-block;
}

.footer-links a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--cinema-primary);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: var(--cinema-primary);
  transform: translateX(5px);
}

.footer-links a:hover::before {
  opacity: 1;
  background-color: var(--cinema-secondary);
}

/* Thông tin liên hệ */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
}

.contact-item i {
  color: var(--cinema-primary);
  margin-right: 10px;
  font-size: 1rem;
  margin-top: 4px;
}

.contact-item span {
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Copyright */
.footer-bottom {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.copyright, .developer {
  font-size: 0.85rem;
  color: var(--cinema-text-muted);
}

/* Responsive */
@media (max-width: 992px) {
  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
