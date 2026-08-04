import React from 'react';

const Timetable = ({ registeredList, onUnregister }) => {
  const days = [
    { key: '2', label: 'T2', sub: 'Thứ 2' },
    { key: '3', label: 'T3', sub: 'Thứ 3' },
    { key: '4', label: 'T4', sub: 'Thứ 4' },
    { key: '5', label: 'T5', sub: 'Thứ 5' },
    { key: '6', label: 'T6', sub: 'Thứ 6' },
    { key: '7', label: 'T7', sub: 'Thứ 7' },
    { key: 'CN', label: 'CN', sub: 'Chủ nhật' }
  ];

  const hours = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00'
  ];

  const normalizeDay = (val) => {
    if (!val) return '';
    let s = String(val).trim();
    if (s.endsWith('.0')) s = s.slice(0, -2);
    if (s === '8' || s === 'CN' || s.toLowerCase().includes('chủ nhật')) return 'CN';
    if (s.toLowerCase().startsWith('thứ')) s = s.replace(/thứ/i, '').trim();
    return s;
  };

  const getEventPosition = (kip, tietBD, soTiet) => {
    let startHourIndex = 1; // Default 07:00 (Tiết 1)
    let countHours = parseInt(soTiet) || 2;

    const tNum = parseInt(normalizeDay(tietBD));
    const kipNum = parseInt(normalizeDay(kip));

    // Priority 1: Use exact Tiết Bắt Đầu (tietBD) if available
    if (!isNaN(tNum) && tNum >= 1) {
      if (tNum <= 5) {
        startHourIndex = tNum; // Tiết 1 = 07:00 (idx 1), Tiết 2 = 08:00 (idx 2)... Tiết 5 = 11:00 (idx 5)
      } else if (tNum === 6 || tNum === 7) {
        startHourIndex = (countHours === 4) ? 7 : (tNum === 6 ? 7 : 8); // Ca chiều: 13:00 (idx 7) hoặc 14:00 (idx 8)
      } else if (tNum === 8) {
        startHourIndex = 9;  // Tiết 8 = 15:00 (idx 9)
      } else if (tNum === 9) {
        startHourIndex = 10; // Tiết 9 = 16:00 (idx 10)
      } else if (tNum === 10) {
        startHourIndex = 11; // Tiết 10 = 17:00 (idx 11)
      } else if (tNum === 11) {
        startHourIndex = 12; // Tiết 11 = 18:00 (idx 12)
      } else if (tNum === 12) {
        startHourIndex = 13; // Tiết 12 = 19:00 (idx 13)
      } else if (tNum >= 13) {
        startHourIndex = 14; // Tiết 13/14 = 20:00 (idx 14)
      }
    } 
    // Priority 2: Fallback to Kíp (1..6) if tietBD is not provided
    else if (!isNaN(kipNum) && kipNum >= 1) {
      if (kipNum === 1) startHourIndex = 1;       // Kíp 1 -> 07:00
      else if (kipNum === 2) startHourIndex = 3;  // Kíp 2 -> 09:00
      else if (kipNum === 3) startHourIndex = 5;  // Kíp 3 -> 11:00
      else if (kipNum === 4) startHourIndex = 7;  // Kíp 4 -> 13:00
      else if (kipNum === 5) startHourIndex = 9;  // Kíp 5 -> 15:00
      else if (kipNum === 6) startHourIndex = 12; // Kíp 6 -> 18:00
    }

    const rowHeight = 50; // Must strictly match grid row height (50px)
    const top = startHourIndex * rowHeight + 2;
    const height = countHours * rowHeight - 4;

    const startHourStr = hours[startHourIndex] || '07:00';
    const endHourStr = hours[Math.min(hours.length - 1, startHourIndex + countHours)] || '09:00';

    return { top: `${top}px`, height: `${height}px`, timeRangeStr: `${startHourStr} - ${endHourStr}` };
  };

  const getLearningTypeStyle = (sub) => {
    const pStr = (sub.phong || '').toLowerCase();
    const nStr = (sub.nha || '').toLowerCase();
    const nameStr = (sub.tenMon || '').toLowerCase();

    // 1. Online Class -> Green
    if (pStr.includes('online') || pStr.includes('zoom') || pStr.includes('onl') || pStr.includes('teams') || nStr.includes('online') || nameStr.includes('online')) {
      return {
        typeLabel: 'Online',
        bg: 'rgba(16, 185, 129, 0.18)',
        borderColor: '#10b981',
        borderLeft: '4px solid #10b981',
        text: 'var(--text-primary)',
        badgeBg: 'rgba(16, 185, 129, 0.25)',
        badgeText: '#059669'
      };
    }

    // 2. Practice/Lab Class (TH) -> Yellow
    if (sub.toTH || nameStr.includes('thực hành') || nameStr.includes('thí nghiệm') || (sub.maLop || '').toLowerCase().includes('th')) {
      return {
        typeLabel: 'Thực hành',
        bg: 'rgba(245, 158, 11, 0.18)',
        borderColor: '#f59e0b',
        borderLeft: '4px solid #f59e0b',
        text: 'var(--text-primary)',
        badgeBg: 'rgba(245, 158, 11, 0.25)',
        badgeText: '#d97706'
      };
    }

    // 3. Direct Class (LT) -> Blue
    return {
      typeLabel: 'Trực tiếp',
      bg: 'rgba(59, 130, 246, 0.18)',
      borderColor: '#3b82f6',
      borderLeft: '4px solid #3b82f6',
      text: 'var(--text-primary)',
      badgeBg: 'rgba(59, 130, 246, 0.25)',
      badgeText: '#2563eb'
    };
  };

  const handleExportCSV = () => {
    if (registeredList.length === 0) {
      alert('Chưa chọn môn học nào để xuất lịch!');
      return;
    }

    let csvContent = '\uFEFFMã môn,Tên môn học,Lớp HP,Thứ,Kíp,Thời gian,Phòng,Nhà,Giảng viên,Số TC\n';
    registeredList.forEach(item => {
      const { timeRangeStr } = getEventPosition(item.kip, item.tietBD, item.soTiet);
      csvContent += `"${item.maMon}","${item.tenMon}","${item.maLop}","Thứ ${item.thu}","Kíp ${item.kip}","${timeRangeStr}","${item.phong}","${item.nha || 'HQV'}","${item.giangVien || ''}",${item.soTC}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Lich_Hoc_PTIT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div id="printable-timetable" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', boxShadow: 'var(--shadow-sm)' }}>
      
      {/* Top Header & Export Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Legend Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <i className="fa-solid fa-palette" style={{ color: 'var(--ptit-red)' }}></i> Phân loại:
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.25)', borderLeft: '4px solid #3b82f6', borderRadius: '3px' }}></span>
            Học trực tiếp
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: 'rgba(245, 158, 11, 0.25)', borderLeft: '4px solid #f59e0b', borderRadius: '3px' }}></span>
            Thực hành
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.25)', borderLeft: '4px solid #10b981', borderRadius: '3px' }}></span>
            Học Online
          </span>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleExportCSV}
            className="btn btn-outline"
            style={{ fontSize: '0.78rem', padding: '4px 10px', color: '#10b981', borderColor: '#10b981' }}
            title="Xuất file danh sách lịch học CSV/Excel"
          >
            <i className="fa-solid fa-file-csv"></i> Xuất Lịch (.csv)
          </button>

          <button 
            onClick={handlePrintSchedule}
            className="btn btn-ptit"
            style={{ fontSize: '0.78rem', padding: '4px 12px' }}
            title="In hoặc lưu PDF lịch học"
          >
            <i className="fa-solid fa-print"></i> In / Lưu Lịch
          </button>
        </div>

      </div>

      {/* Main Timetable Schedule Grid Container with Outer Scrollbar */}
      <div style={{ maxHeight: 'calc(100vh - 250px)', minHeight: '440px', overflowY: 'auto', overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-card)' }}>
        
        {/* Sticky Header Row matching screenshot */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', borderBottom: '2px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ padding: '6px 2px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, borderRight: '1px solid var(--border-color)' }}>
            Giờ
          </div>
          {days.map((d) => (
            <div 
              key={d.key} 
              style={{ 
                padding: '6px 2px', 
                textAlign: 'center', 
                borderRight: '1px solid var(--border-color)'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                {d.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {d.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Grid Body divided strictly by Hour Rows (06:00 - 20:00) */}
        <div style={{ position: 'relative', height: `${hours.length * 50}px` }}>
          
          {hours.map((h, i) => (
            <div 
              key={h} 
              style={{ 
                position: 'absolute', 
                top: `${i * 50}px`, 
                left: 0, 
                right: 0, 
                height: '50px', 
                display: 'grid', 
                gridTemplateColumns: '52px repeat(7, 1fr)',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              <div style={{ padding: '6px 2px', textAlign: 'center', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {h}
              </div>

              {days.map((d) => (
                <div 
                  key={d.key} 
                  style={{ borderRight: '1px solid var(--border-color)' }} 
                />
              ))}
            </div>
          ))}

          {/* Render Registered Event Cards Perfectly Aligned with Hour Grid Lines */}
          {registeredList.map((sub) => {
            const cleanThu = normalizeDay(sub.thu);
            const dayColIdx = days.findIndex(d => d.key === cleanThu);
            const targetColIdx = dayColIdx !== -1 ? dayColIdx : 0;

            const { top, height, timeRangeStr } = getEventPosition(sub.kip, sub.tietBD, sub.soTiet);
            const leftCalc = `calc(52px + ${targetColIdx} * ((100% - 52px) / 7) + 2px)`;
            const widthCalc = `calc(((100% - 52px) / 7) - 4px)`;
            
            const typeStyle = getLearningTypeStyle(sub);

            return (
              <div
                key={sub._id}
                style={{
                  position: 'absolute',
                  top,
                  left: leftCalc,
                  width: widthCalc,
                  height,
                  background: typeStyle.bg,
                  border: `1px solid ${typeStyle.borderColor}`,
                  borderLeft: typeStyle.borderLeft,
                  color: typeStyle.text,
                  borderRadius: '6px',
                  padding: '5px 7px',
                  zIndex: 10,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  fontSize: '0.73rem',
                  lineHeight: '1.3',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                }}
              >
                {/* Delete "x" Button in Top Right Corner */}
                <button
                  className="no-print"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUnregister) onUnregister(sub._id);
                  }}
                  style={{
                    position: 'sticky',
                    float: 'right',
                    top: '0px',
                    right: '0px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    zIndex: 15,
                    marginLeft: '4px',
                    marginBottom: '2px'
                  }}
                  title={`Hủy môn ${sub.tenMon}`}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Top Line: Badge Type & Hour Time Range */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', paddingRight: '18px', flexWrap: 'wrap' }}>
                  <span style={{ background: typeStyle.badgeBg, color: typeStyle.badgeText, fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                    {typeStyle.typeLabel}
                  </span>
                  <span style={{ fontSize: '0.64rem', fontWeight: 700, opacity: 0.9 }}>
                    {timeRangeStr} ({sub.soTC ? sub.soTC + 'TC • ' : ''}{sub.soTiet || 2} tiết)
                  </span>
                </div>

                {/* Subject Name - Full Text Display */}
                <div style={{ fontWeight: 800, fontSize: '0.78rem', marginBottom: '3px', lineHeight: 1.25, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {sub.tenMon}
                </div>

                {/* Subject Code & Group */}
                <div style={{ fontSize: '0.68rem', opacity: 0.95, fontWeight: 700, color: 'var(--ptit-red)', marginBottom: '3px' }}>
                  {sub.maMon} {sub.nhom ? `• Nhóm ${sub.nhom}` : ''} {sub.toTH ? `(Tổ TH ${sub.toTH})` : ''}
                </div>

                {/* Room & Building */}
                <div style={{ fontSize: '0.68rem', marginTop: '2px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', color: 'var(--text-primary)' }}>
                  <span><i className="fa-solid fa-location-dot" style={{ fontSize: '0.64rem', color: 'var(--ptit-red)' }}></i> P.{sub.phong || 'HT2'} - nhà {sub.nha || 'HQV'}</span>
                </div>

                {/* Teacher Name */}
                {sub.giangVien && sub.giangVien !== '---' && (
                  <div style={{ fontSize: '0.66rem', marginTop: '3px', fontWeight: 600, opacity: 0.9, wordBreak: 'break-word' }}>
                    <i className="fa-solid fa-user-tie" style={{ fontSize: '0.62rem' }}></i> {sub.giangVien}
                  </div>
                )}

                {/* Weeks Annotation (Tuần: 1 2 3...) - Full display */}
                <div style={{ fontSize: '0.64rem', marginTop: '4px', fontWeight: 600, opacity: 0.95, wordBreak: 'break-word', lineHeight: 1.35 }}>
                  <i className="fa-regular fa-calendar-check" style={{ color: 'var(--ptit-red)', fontSize: '0.62rem' }}></i> Tuần: <span style={{ fontWeight: 800 }}>{sub.tuanHoc || '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15'}</span>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Flexible / Unassigned Online Subjects Section */}
      {registeredList.filter(s => !s.thu || !normalizeDay(s.thu)).length > 0 && (
        <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid #10b981' }}>
          <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.88rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-laptop-code"></i> Môn Học Online / Lớp Chưa Xếp Lịch Cố Định ({registeredList.filter(s => !s.thu || !normalizeDay(s.thu)).length}):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {registeredList.filter(s => !s.thu || !normalizeDay(s.thu)).map(sub => (
              <div key={sub._id} style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '8px', border: '1px solid #10b981', position: 'relative' }}>
                <button
                  onClick={() => onUnregister && onUnregister(sub._id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Hủy môn"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)', paddingRight: '24px' }}>{sub.tenMon}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ptit-red)', fontWeight: 700, marginTop: '2px' }}>{sub.maMon} • Nhóm {sub.nhom} {sub.toTH ? `(Tổ TH ${sub.toTH})` : ''}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>P.{sub.phong || 'ONL'} - Nhà {sub.nha || 'Online'} | GV: {sub.giangVien || '---'}</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: '3px' }}>
                  <i className="fa-regular fa-calendar-check"></i> Tuần: {sub.tuanHoc || 'Tự học / Linh hoạt'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Timetable;
