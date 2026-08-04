import React from 'react';

const RegisteredList = ({ registeredList, onUnregister, onClearAll }) => {
  const totalCredits = registeredList.reduce((sum, item) => sum + (parseInt(item.soTC) || 0), 0);
  const totalCount = registeredList.length;

  return (
    <div className="glass-panel" style={{ padding: '14px', marginBottom: '16px', background: 'var(--bg-card)' }}>
      
      {/* Card Header: Đã chọn (X) Y tín chỉ | Bỏ hết */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
          Đã chọn <span style={{ color: 'var(--ptit-red)' }}>({totalCount})</span> <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{totalCredits} tín chỉ</span>
        </div>

        {totalCount > 0 && (
          <button 
            onClick={onClearAll} 
            className="btn btn-outline" 
            style={{ fontSize: '0.74rem', padding: '3px 8px', color: 'var(--text-muted)', border: 'none' }}
          >
            Bỏ hết
          </button>
        )}
      </div>

      {registeredList.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Chưa chọn lớp môn học nào. Nhấp <strong>"+ Xếp"</strong> bên dưới để chọn môn.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
          {registeredList.map((item) => (
            <div 
              key={item._id} 
              style={{ 
                padding: '10px 12px', 
                borderRadius: '8px', 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {item.tenMon}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{item.maMon}</span>
                  <span>•</span>
                  <span>Nhóm {item.nhom || '01'}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 700, color: 'var(--ptit-red)' }}>{item.soTC} TC</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  T{item.thu}-K{item.kip}
                </span>

                <button 
                  onClick={() => onUnregister(item._id)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px' }}
                  title="Bỏ chọn"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RegisteredList;
