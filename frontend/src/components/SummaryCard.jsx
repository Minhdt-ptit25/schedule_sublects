import React, { useState } from 'react';

const SummaryCard = ({ registeredList, student }) => {
  const [feePerCredit, setFeePerCredit] = useState(480000); // Default 480,000 VNĐ / credit

  const totalCredits = registeredList.reduce((sum, item) => sum + (parseInt(item.soTC) || 0), 0);
  const totalSubjects = registeredList.length;
  const totalTuition = totalCredits * feePerCredit;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'center' }}>
        
        {/* Total Subjects */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tổng số môn đã chọn</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalSubjects} Môn</div>
        </div>

        {/* Total Credits */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số tín chỉ đăng ký</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ptit-red)' }}>
            {totalCredits} / {student.maxCredits || 30} TC
          </div>
        </div>

        {/* Input Fee Per Credit */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600 }}>
            Học phí / 1 tín chỉ (VNĐ)
          </label>
          <input
            type="number"
            className="form-input"
            style={{ padding: '6px 10px', fontSize: '0.85rem', fontWeight: 600 }}
            value={feePerCredit}
            onChange={(e) => setFeePerCredit(Math.max(0, parseInt(e.target.value) || 0))}
            step="10000"
          />
        </div>

        {/* Calculated Total Tuition */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tổng học phí tạm tính</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--warning)' }}>
            {totalTuition.toLocaleString('vi-VN')} VNĐ
          </div>
        </div>

        {/* Print Button */}
        <div style={{ textAlign: 'right' }}>
          <button onClick={handlePrint} className="btn btn-ptit" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <i className="fa-solid fa-print"></i> In phiếu đăng ký
          </button>
        </div>

      </div>
    </div>
  );
};

export default SummaryCard;
