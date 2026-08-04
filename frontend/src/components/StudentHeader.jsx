import React from 'react';

const StudentHeader = ({ student }) => {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', borderTop: '4px solid var(--ptit-red)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--ptit-red-light)', border: '2px solid var(--ptit-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--ptit-red)' }}>
            <i className="fa-solid fa-user-graduate"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Họ và tên SV</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{student.fullName}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã số Sinh viên</div>
          <div style={{ fontWeight: 700, color: 'var(--ptit-red)' }}>{student.studentId}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lớp sinh hoạt</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.classCode}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Khoa / Ngành</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.major}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
