import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import SubjectFilter from './components/SubjectFilter';
import SubjectTable from './components/SubjectTable';
import Timetable from './components/Timetable';
import ExcelUploadModal from './components/ExcelUploadModal';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://schedule-sublects.onrender.com/api';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };
  const [subjects, setSubjects] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [majors, setMajors] = useState([]);
  const [registeredList, setRegisteredList] = useState([]);
  
  // Tuition Fee State (Default 480,000 VNĐ per credit for PTIT)
  const [pricePerCredit, setPricePerCredit] = useState(480000);

  // Excel Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedKhoa, setSelectedKhoa] = useState('ALL');
  const [selectedMonHoc, setSelectedMonHoc] = useState('ALL');
  const [selectedNganh, setSelectedNganh] = useState('ALL');
  const [selectedThu, setSelectedThu] = useState('ALL');
  const [selectedKip, setSelectedKip] = useState('ALL');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState('ALL');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);



  const showAlert = (message, type = 'info') => {
    setAlert({ message, type, id: Date.now() });
    setTimeout(() => setAlert(null), 3500);
  };

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/registrations/B25DCCC145`);
      if (res.data.success) {
        setRegisteredList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching registrations', err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim(),
        khoa: selectedKhoa,
        monHoc: selectedMonHoc,
        nganh: selectedNganh,
        thu: selectedThu,
        kip: selectedKip,
        page,
        limit
      };
      const res = await axios.get(`${API_BASE}/subjects`, { params });
      if (res.data.success) {
        setSubjects(res.data.data);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.khoaList) setKhoaList(res.data.khoaList);
        if (res.data.majors) setMajors(res.data.majors);
        if (res.data.subjectList) setSubjectList(res.data.subjectList);
      }
    } catch (err) {
      console.error('Error fetching subjects', err);
      showAlert('Lỗi tải danh sách môn học từ server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedKhoa('ALL');
    setSelectedMonHoc('ALL');
    setSelectedNganh('ALL');
    setSelectedThu('ALL');
    setSelectedKip('ALL');
    setPage(1);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedKhoa, selectedMonHoc, selectedNganh, selectedThu, selectedKip]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedKhoa, selectedMonHoc, selectedNganh, selectedThu, selectedKip, page, limit]);

  const handleRegister = async (subjectId) => {
    try {
      const res = await axios.post(`${API_BASE}/registrations`, {
        studentId: 'B25DCCC145',
        subjectId
      });

      if (res.data.success) {
        showAlert(res.data.message, 'success');
        fetchRegistrations();
        fetchSubjects();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi đăng ký môn';
      showAlert(msg, 'error');
    }
  };

  const handleUnregister = async (registrationId) => {
    try {
      const res = await axios.delete(`${API_BASE}/registrations/${registrationId}`);
      if (res.data.success) {
        showAlert(res.data.message, 'info');
        fetchRegistrations();
        fetchSubjects();
      }
    } catch (err) {
      showAlert('Lỗi khi hủy môn học', 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      for (const item of registeredList) {
        await axios.delete(`${API_BASE}/registrations/${item._id}`);
      }
      showAlert('Đã xóa tất cả các môn đã chọn', 'info');
      fetchRegistrations();
      fetchSubjects();
    } catch (err) {
      showAlert('Lỗi khi bỏ tất cả môn', 'error');
    }
  };

  const registeredCount = registeredList.length;
  const totalCredits = registeredList.reduce((sum, item) => sum + (parseInt(item.soTC) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px', background: 'var(--bg-main)' }}>
      
      {/* TOP-RIGHT FLOATING TOAST NOTIFICATION CARD */}
      {alert && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '24px', 
            right: '24px', 
            zIndex: 999999, 
            minWidth: '320px',
            maxWidth: '420px',
            background: 'var(--bg-card)', 
            color: 'var(--text-primary)',
            padding: '14px 18px', 
            borderRadius: '14px', 
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)', 
            border: '1px solid var(--border-light)',
            borderLeft: alert.type === 'success' ? '5px solid #10b981' : alert.type === 'error' ? '5px solid #ef4444' : '5px solid #3b82f6',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i 
              className={`fa-solid ${alert.type === 'success' ? 'fa-circle-check' : alert.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'} fa-lg`}
              style={{ color: alert.type === 'success' ? '#10b981' : alert.type === 'error' ? '#ef4444' : '#3b82f6' }}
            ></i>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35 }}>
              {alert.message}
            </div>
          </div>

          <button 
            onClick={() => setAlert(null)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '1rem', 
              cursor: 'pointer',
              padding: '2px 4px'
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Top Navbar Header */}
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        registeredCount={registeredCount}
        totalCredits={totalCredits}
        pricePerCredit={pricePerCredit}
        setPricePerCredit={setPricePerCredit}
        onClearAll={handleClearAll}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      <main style={{ maxWidth: '1536px', margin: '0 auto', padding: '0 16px' }}>

        {/* Top Horizontal Filter Bar */}
        <SubjectFilter 
          search={search}
          setSearch={setSearch}
          selectedKhoa={selectedKhoa}
          setSelectedKhoa={setSelectedKhoa}
          khoaList={khoaList}
          selectedMonHoc={selectedMonHoc}
          setSelectedMonHoc={setSelectedMonHoc}
          subjectList={subjectList}
          selectedNganh={selectedNganh}
          setSelectedNganh={setSelectedNganh}
          majors={majors}
          selectedThu={selectedThu}
          setSelectedThu={setSelectedThu}
          selectedKip={selectedKip}
          setSelectedKip={setSelectedKip}
          onResetFilters={handleResetFilters}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        {/* 2-Column Split Layout */}
        <div className="app-split-layout">

          {/* LEFT SIDEBAR: Full Height Available Subjects List */}
          <div className="layout-left">
            <SubjectTable 
              subjects={subjects}
              registeredList={registeredList}
              onRegister={handleRegister}
              loading={loading}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              total={total}
              totalPages={totalPages}
            />
          </div>

          {/* RIGHT MAIN PANEL: Calendar Timetable Grid */}
          <div className="layout-right">
            <Timetable 
              registeredList={registeredList} 
              onUnregister={handleUnregister} 
            />
          </div>

        </div>

      </main>

      {/* FULL SCREEN EXCEL UPLOAD MODAL */}
      <ExcelUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={fetchSubjects}
        showAlert={showAlert}
      />
    </div>
  );
}

export default App;
