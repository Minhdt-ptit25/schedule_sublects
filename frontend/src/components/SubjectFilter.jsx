import React from 'react';

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

const SubjectFilter = ({ 
  search, setSearch, 
  selectedKhoa, setSelectedKhoa, khoaList,
  selectedMonHoc, setSelectedMonHoc, subjectList,
  selectedNganh, setSelectedNganh, majors,
  selectedThu, setSelectedThu, 
  selectedKip, setSelectedKip,
  onResetFilters,
  onOpenUploadModal
}) => {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '8px 14px', marginBottom: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        
        {/* KHÓA Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            KHÓA
          </span>
          <select 
            className="form-select" 
            style={{ width: '95px', padding: '4px 6px', fontSize: '0.78rem', fontWeight: 600 }}
            value={selectedKhoa} 
            onChange={(e) => {
              setSelectedKhoa(e.target.value);
              setSelectedMonHoc('ALL'); // Reset subject when Cohort changes
            }}
          >
            <option value="ALL">Tất cả</option>
            {khoaList.map((k, idx) => (
              <option key={idx} value={k}>{formatKhoaName(k)}</option>
            ))}
          </select>
        </div>

        {/* NGÀNH Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            NGÀNH
          </span>
          <select 
            className="form-select" 
            style={{ width: '120px', padding: '4px 6px', fontSize: '0.78rem', fontWeight: 600 }}
            value={selectedNganh} 
            onChange={(e) => {
              setSelectedNganh(e.target.value);
              setSelectedMonHoc('ALL'); // Reset subject when Major changes
            }}
          >
            <option value="ALL">Tất cả ngành</option>
            {majors.map((m, idx) => (
              <option key={idx} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* MÔN HỌC Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            MÔN HỌC
          </span>
          <select 
            className="form-select" 
            style={{ maxWidth: '190px', padding: '4px 6px', fontSize: '0.78rem', fontWeight: 600 }}
            value={selectedMonHoc} 
            onChange={(e) => setSelectedMonHoc(e.target.value)}
          >
            <option value="ALL">Tất cả môn ({subjectList ? subjectList.length : 0})</option>
            {subjectList && subjectList.map((sub, idx) => (
              <option key={idx} value={sub.maMon}>
                {sub.maMon} - {sub.tenMon}
              </option>
            ))}
          </select>
        </div>

        {/* Search Text Input */}
        <div style={{ flex: '1 1 180px', minWidth: '150px', position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.75rem' }}></i>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '28px', padding: '4px 8px 4px 28px', fontSize: '0.78rem' }}
            placeholder="Tìm theo tên hoặc mã môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Reset Filters Button */}
        <button 
          onClick={onResetFilters} 
          className="btn btn-outline" 
          style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--text-muted)' }}
        >
          Đặt lại
        </button>

      </div>
    </div>
  );
};

export default SubjectFilter;
