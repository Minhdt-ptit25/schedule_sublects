import React from 'react';

const Navbar = ({ 
  theme, 
  toggleTheme, 
  registeredCount, 
  totalCredits, 
  pricePerCredit, 
  setPricePerCredit,
  onClearAll, 
  onOpenUploadModal 
}) => {
  const totalTuition = totalCredits * (parseInt(pricePerCredit) || 0);

  return (
    <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', marginBottom: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ maxWidth: '1536px', margin: '0 auto', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Simple Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-calendar-days" style={{ color: 'var(--ptit-red)' }}></i> Giả Lập Xếp Lịch Học
          </h1>
        </div>

        {/* Tuition Fee Calculator & Registered Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Price Per Credit Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <i className="fa-solid fa-coins" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Đơn giá/Tín:</span>
            <input 
              type="number" 
              className="form-input" 
              style={{ width: '90px', padding: '2px 5px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'right' }}
              value={pricePerCredit}
              onChange={(e) => setPricePerCredit(e.target.value)}
              placeholder="VNĐ/Tín"
              step="10000"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>đ</span>
          </div>

          {/* Total Tuition Fee Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ptit-red-light)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--ptit-red)' }}>
            <i className="fa-solid fa-calculator" style={{ color: 'var(--ptit-red)', fontSize: '0.85rem' }}></i>
            <div>
              <div style={{ fontSize: '0.64rem', color: 'var(--ptit-red)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1 }}>
                Tổng Học Phí Dự Kiến
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--ptit-red)', lineHeight: 1.1 }}>
                {totalTuition.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>
          </div>

          {/* Registered Credits Count Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Đã xếp: <strong style={{ color: 'var(--ptit-red)', fontSize: '0.85rem' }}>{registeredCount}</strong> môn (<strong style={{ color: 'var(--ptit-red)', fontSize: '0.85rem' }}>{totalCredits}</strong> TC)
            </span>
            {registeredCount > 0 && (
              <button 
                onClick={onClearAll}
                className="btn btn-outline" 
                style={{ fontSize: '0.68rem', padding: '2px 5px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                title="Bỏ tất cả môn đã đăng ký"
              >
                Xóa hết
              </button>
            )}
          </div>

          {/* Upload Excel Button */}
          <button 
            onClick={onOpenUploadModal}
            className="btn"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontWeight: 800, fontSize: '0.78rem', padding: '5px 12px', boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25)' }}
          >
            <i className="fa-solid fa-file-excel"></i> Nạp File Excel
          </button>

          {/* Dark/Light Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-outline"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', fontSize: '0.9rem' }}
            title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} style={{ color: theme === 'dark' ? '#f59e0b' : 'var(--text-primary)' }}></i>
          </button>

        </div>

      </div>
    </header>
  );
};

export default Navbar;
