import React, { useState } from 'react';

const formatKhoaName = (k) => {
  if (!k) return '';
  let s = String(k).trim();
  if (s.endsWith('.0')) s = s.slice(0, -2);
  if (s.toLowerCase().startsWith('khóa')) s = s.slice(4).trim();
  else if (s.toLowerCase().startsWith('k')) s = s.slice(1).trim();
  if (/^\d{4}$/.test(s)) return `D${s.slice(2)}`;
  if (/^\d{2}$/.test(s)) return `D${s}`;
  if (s.toUpperCase().startsWith('D')) return s.toUpperCase();
  return `D${s}`;
};

// Helper function to get learning type style & badge for any subject
const getLearningTypeBadge = (sub) => {
  const pStr = (sub.phong || '').toLowerCase();
  const nStr = (sub.nha || '').toLowerCase();
  const nameStr = (sub.tenMon || '').toLowerCase();

  // 1. Online Class -> Green
  if (pStr.includes('online') || pStr.includes('zoom') || pStr.includes('onl') || pStr.includes('teams') || nStr.includes('online') || nameStr.includes('online')) {
    return {
      label: 'Online',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#059669',
      borderLeft: '3px solid #10b981'
    };
  }

  // 2. Practice Class (TH) -> Yellow / Orange
  if (sub.toTH || nameStr.includes('thực hành') || nameStr.includes('thí nghiệm') || (sub.maLop || '').toLowerCase().includes('th')) {
    return {
      label: 'Thực hành',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#d97706',
      borderLeft: '3px solid #f59e0b'
    };
  }

  // 3. Direct Theory Class (LT) -> Blue
  return {
    label: 'Trực tiếp',
    bg: 'rgba(59, 130, 246, 0.15)',
    color: '#2563eb',
    borderLeft: '3px solid #3b82f6'
  };
};

const SubjectTable = ({ 
  subjects, 
  registeredList, 
  onRegister, 
  loading,
  page,
  setPage,
  limit,
  setLimit,
  total,
  totalPages
}) => {
  const [viewType, setViewType] = useState('excel');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const checkIsTH = (sub) => {
    if (!sub) return false;
    const nameStr = (sub.tenMon || '').toLowerCase();
    return !!(sub.toTH || nameStr.includes('thực hành') || nameStr.includes('thí nghiệm') || (sub.maLop || '').toLowerCase().includes('th'));
  };

  const getSubjectStatus = (subject) => {
    // 1. Exact Registered
    const exactClass = registeredList.find(r => r.subjectId === subject._id || (r.maMon === subject.maMon && r.maLop === subject.maLop && (r.toTH || '') === (subject.toTH || '')));
    if (exactClass) {
      return { type: 'EXACT_REGISTERED', registeredClass: exactClass };
    }

    // 2. Registrations of the same subject code (maMon)
    const sameMonRegs = registeredList.filter(r => r.maMon === subject.maMon);

    if (sameMonRegs.length > 0) {
      // Check Group Matching (CÙNG NHÓM)
      const diffGroupReg = sameMonRegs.find(r => r.nhom && subject.nhom && r.nhom !== subject.nhom);
      if (diffGroupReg) {
        return { type: 'DIFF_GROUP', requiredNhom: diffGroupReg.nhom };
      }

      // Check if same component (LT or TH) already registered
      const targetIsTH = checkIsTH(subject);
      if (targetIsTH) {
        const existingTH = sameMonRegs.find(r => checkIsTH(r));
        if (existingTH) {
          return { type: 'SAME_COMPONENT_REGISTERED', label: 'Đã chọn Tổ TH' };
        }
      } else {
        const existingLT = sameMonRegs.find(r => !checkIsTH(r));
        if (existingLT) {
          return { type: 'SAME_COMPONENT_REGISTERED', label: 'Đã chọn LT' };
        }
      }
    }

    // 3. Check Schedule Conflict
    const conflictSubject = registeredList.find(r => {
      if (!r.thu || !subject.thu) return false;
      if (r.thu === subject.thu) {
        if (r.kip === subject.kip) return true;
        if (r.tietBD && subject.tietBD) {
          const rStart = parseInt(r.tietBD);
          const rEnd = rStart + (parseInt(r.soTiet) || 2) - 1;
          const tStart = parseInt(subject.tietBD);
          const tEnd = tStart + (parseInt(subject.soTiet) || 2) - 1;
          return !(rEnd < tStart || tEnd < rStart);
        }
      }
      return false;
    });

    if (conflictSubject) {
      return { type: 'SCHEDULE_CONFLICT', conflictSubject };
    }

    if (subject.daDangKyCount >= subject.sySo) {
      return { type: 'FULL' };
    }

    return { type: 'AVAILABLE' };
  };

  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };
  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 4;
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      if (i >= 1) pages.push(i);
    }
    return pages;
  };

  // Reusable Excel Table Element
  const renderExcelTableContent = (maxHeightStr = 'calc(100vh - 280px)') => (
    <div style={{ overflowX: 'auto', maxHeight: maxHeightStr, minHeight: '380px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem', color: 'var(--text-primary)' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap' }}>Hình thức</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap' }}>Mã môn</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap', minWidth: '130px' }}>Tên môn học / HP</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngành</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Sỹ số</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Nhóm</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổ TH</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Kíp</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết BD</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap' }}>Nhà</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap', minWidth: '100px' }}>Giảng viên</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap' }}>Mã lớp HP</th>
            <th style={{ padding: '6px 5px', whiteSpace: 'nowrap' }}>Tuần học</th>
            <th style={{ padding: '6px 4px', whiteSpace: 'nowrap', textAlign: 'center' }}>Số TC</th>
            <th style={{ padding: '6px 6px', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub) => {
            const status = getSubjectStatus(sub);
            const khoaDisplay = formatKhoaName(sub.khoa);
            const typeBadge = getLearningTypeBadge(sub);

            return (
              <tr 
                key={sub._id} 
                style={{ 
                  borderBottom: '1px solid var(--border-light)',
                  background: status.type === 'EXACT_REGISTERED' ? 'var(--success-bg)' : status.type === 'SCHEDULE_CONFLICT' ? 'var(--warning-bg)' : 'transparent',
                  opacity: status.type === 'SAME_SUBJECT_REGISTERED' ? 0.65 : 1
                }}
              >
                <td style={{ padding: '7px 6px', whiteSpace: 'nowrap' }}>
                  <span 
                    style={{ 
                      background: typeBadge.bg, 
                      color: typeBadge.color, 
                      borderLeft: typeBadge.borderLeft, 
                      padding: '2px 7px', 
                      borderRadius: '4px', 
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      display: 'inline-block'
                    }}
                  >
                    {typeBadge.label}
                  </span>
                </td>

                <td style={{ padding: '7px 6px', fontWeight: 700, color: 'var(--ptit-red)', whiteSpace: 'nowrap' }}>{sub.maMon}</td>
                <td style={{ padding: '7px 6px', fontWeight: 600 }}>{sub.tenMon}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 700, color: 'var(--ptit-red)' }}>{khoaDisplay || '-'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.he || 'ĐH'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.nganh || 'Chung'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.daDangKyCount}/{sub.sySo}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.nhom || '01'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.toTH || '-'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>T{sub.thu}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>K{sub.kip}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.tietBD || '-'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.soTiet || '2'}</td>
                <td style={{ padding: '7px 6px', whiteSpace: 'nowrap' }}>{sub.phong}</td>
                <td style={{ padding: '7px 6px', whiteSpace: 'nowrap' }}>{sub.nha || 'HQV'}</td>
                <td style={{ padding: '7px 6px', whiteSpace: 'nowrap' }}>{sub.giangVien || '---'}</td>
                <td style={{ padding: '7px 6px', whiteSpace: 'nowrap', fontWeight: 600 }}>{sub.maLop}</td>
                <td style={{ padding: '7px 6px', whiteSpace: 'nowrap', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{sub.tuanHoc || '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15'}</td>
                <td style={{ padding: '7px 4px', textAlign: 'center', fontWeight: 700, color: 'var(--ptit-red)', whiteSpace: 'nowrap' }}>{sub.soTC}</td>

                <td style={{ padding: '7px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {status.type === 'EXACT_REGISTERED' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, background: 'var(--success-bg)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      Đã xếp
                    </span>
                  )}

                  {status.type === 'DIFF_GROUP' && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }} title={`Yêu cầu chọn cùng Nhóm ${status.requiredNhom}`}>
                      Khác nhóm (N{status.requiredNhom})
                    </span>
                  )}

                  {status.type === 'SAME_COMPONENT_REGISTERED' && (
                    <button disabled className="btn btn-outline" style={{ fontSize: '0.68rem', padding: '2px 6px', cursor: 'not-allowed', opacity: 0.7, whiteSpace: 'nowrap' }}>
                      {status.label}
                    </button>
                  )}

                  {status.type === 'SCHEDULE_CONFLICT' && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--warning)', fontWeight: 700, background: 'var(--warning-bg)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      Trùng lịch
                    </span>
                  )}

                  {status.type === 'FULL' && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 700, background: 'var(--danger-bg)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      Hết chỗ
                    </span>
                  )}

                  {status.type === 'AVAILABLE' && (
                    <button 
                      onClick={() => onRegister(sub._id)} 
                      className="btn btn-ptit" 
                      style={{ fontSize: '0.72rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                    >
                      + Xếp
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin fa-lg" style={{ color: 'var(--ptit-red)', marginBottom: '8px' }}></i>
        <div style={{ fontSize: '0.82rem' }}>Đang nạp danh sách học phần...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
      
      {/* Clean Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '8px' }}>
        
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Học phần</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>({total} Lớp HP mở)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Zoom Icon Only Button */}
          <button
            onClick={() => setIsZoomModalOpen(true)}
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.82rem', color: 'var(--ptit-red)', borderColor: 'var(--ptit-red)' }}
            title="Phóng to Bảng Excel ở chính giữa màn hình"
          >
            <i className="fa-solid fa-expand"></i>
          </button>

          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewType('excel')}
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: viewType === 'excel' ? 'var(--ptit-red)' : 'transparent',
                color: viewType === 'excel' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Bảng Excel chuẩn các cột"
            >
              <i className="fa-solid fa-table"></i> Bảng Excel
            </button>
            <button
              onClick={() => setViewType('card')}
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: viewType === 'card' ? 'var(--ptit-red)' : 'transparent',
                color: viewType === 'card' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Thẻ dọc gọn"
            >
              <i className="fa-solid fa-list-ul"></i> Thẻ gọn
            </button>
          </div>

          <select 
            className="form-select" 
            style={{ padding: '2px 6px', fontSize: '0.75rem', width: '90px' }}
            value={limit}
            onChange={(e) => {
              const val = e.target.value;
              setLimit(val === 'ALL' ? 'ALL' : parseInt(val));
              setPage(1);
            }}
          >
            <option value="10">10/trang</option>
            <option value="20">20/trang</option>
            <option value="50">50/trang</option>
            <option value="ALL">Tất cả ({total})</option>
          </select>

        </div>
      </div>

      {subjects.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Không tìm thấy học phần phù hợp.
        </div>
      ) : viewType === 'excel' ? (
        renderExcelTableContent('520px')
      ) : (
        /* COMPACT CARDS VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto', paddingRight: '2px' }}>
          {subjects.map((sub) => {
            const status = getSubjectStatus(sub);
            const khoaDisplay = formatKhoaName(sub.khoa);
            const typeBadge = getLearningTypeBadge(sub);

            return (
              <div 
                key={sub._id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: status.type === 'EXACT_REGISTERED' ? 'var(--success-bg)' : status.type === 'SCHEDULE_CONFLICT' ? 'var(--warning-bg)' : 'var(--bg-card)',
                  opacity: status.type === 'SAME_SUBJECT_REGISTERED' ? 0.65 : 1,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                {/* Header Row: Subject Name & Action Button */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                    {sub.tenMon}
                  </div>

                  {status.type === 'EXACT_REGISTERED' && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700, background: 'var(--success-bg)', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Đã xếp
                    </span>
                  )}

                  {status.type === 'DIFF_GROUP' && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }} title={`Yêu cầu chọn cùng Nhóm ${status.requiredNhom}`}>
                      Khác nhóm (N{status.requiredNhom})
                    </span>
                  )}

                  {status.type === 'SAME_COMPONENT_REGISTERED' && (
                    <button disabled className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '2px 6px', cursor: 'not-allowed', opacity: 0.7, whiteSpace: 'nowrap' }}>
                      {status.label}
                    </button>
                  )}

                  {status.type === 'SCHEDULE_CONFLICT' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700, background: 'var(--warning-bg)', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Trùng lịch
                    </span>
                  )}

                  {status.type === 'FULL' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700, background: 'var(--danger-bg)', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Hết chỗ
                    </span>
                  )}

                  {status.type === 'AVAILABLE' && (
                    <button onClick={() => onRegister(sub._id)} className="btn btn-ptit" style={{ fontSize: '0.74rem', padding: '3px 10px', whiteSpace: 'nowrap' }}>
                      + Xếp
                    </button>
                  )}
                </div>

                {/* Line 2: Badge + Credits + Class Code */}
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: typeBadge.bg, color: typeBadge.color, borderLeft: typeBadge.borderLeft, padding: '1px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem' }}>
                    {typeBadge.label}
                  </span>
                  <span>•</span>
                  <span style={{ fontWeight: 700, color: 'var(--ptit-red)' }}>{sub.soTC} TC</span>
                  <span>•</span>
                  <span style={{ fontWeight: 600 }}>{sub.maLop || sub.maMon}</span>
                </div>

                {/* Line 3: Teacher Name on its OWN SEPARATE ROW */}
                {sub.giangVien && sub.giangVien !== '---' && (
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '3px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.giangVien}
                  </div>
                )}

                {/* Line 4: Time, Room & Cohort */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    Thứ {sub.thu} - Kíp {sub.kip} (P.{sub.phong})
                  </span>
                  {khoaDisplay && (
                    <span style={{ background: 'var(--ptit-red-light)', color: 'var(--ptit-red)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {khoaDisplay}
                    </span>
                  )}
                </div>

                {/* Line 5: Study Weeks (Tuần: 1 2 3...) */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-regular fa-calendar-check" style={{ color: 'var(--ptit-red)', fontSize: '0.72rem' }}></i>
                  <span>Tuần: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{sub.tuanHoc || '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15'}</strong></span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Mini Pagination Footer */}
      {totalPages > 1 && limit !== 'ALL' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
          <button 
            onClick={handlePrevPage} 
            disabled={page === 1} 
            className="btn btn-outline" 
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {getPageNumbers().map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: page === pNum ? 'var(--ptit-red)' : 'transparent',
                  color: page === pNum ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {pNum}
              </button>
            ))}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>/{totalPages}</span>
          </div>

          <button 
            onClick={handleNextPage} 
            disabled={page === totalPages} 
            className="btn btn-outline" 
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* ZOOM MODAL OVERLAY: FULL SCREEN CENTERED EXCEL TABLE */}
      {isZoomModalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0, 0, 0, 0.82)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomModalOpen(false);
          }}
        >
          <div 
            style={{ 
              width: '96vw', 
              maxHeight: '90vh', 
              background: 'var(--bg-card)', 
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid var(--border-light)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
                <i className="fa-solid fa-table-list" style={{ color: 'var(--ptit-red)' }}></i> Bảng Dữ Liệu Excel Môn Học ({total} Lớp HP)
              </h3>
              <button 
                onClick={() => setIsZoomModalOpen(false)} 
                className="btn btn-outline" 
                style={{ border: 'none', fontSize: '1.4rem', padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Render Table Content with large height */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {renderExcelTableContent('72vh')}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <button 
                onClick={() => setIsZoomModalOpen(false)} 
                className="btn btn-ptit" 
                style={{ padding: '8px 24px', fontSize: '0.88rem' }}
              >
                Đóng Bảng Phóng To
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SubjectTable;
