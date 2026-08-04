import React, { useState, useRef } from 'react';
import axios from 'axios';

const ExcelUploadModal = ({ isOpen, onClose, onUploadSuccess, showAlert }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      if (showAlert) showAlert('Vui lòng chọn tệp Excel (.xlsx)', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://schedule-sublects.onrender.com/api';
      const res = await axios.post(`${API_BASE}/subjects/upload-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        if (showAlert) showAlert(res.data.message, 'success');
        setSelectedFile(null);
        onClose();
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi tải tệp Excel lên server';
      if (showAlert) showAlert(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0, 0, 0, 0.78)', 
        backdropFilter: 'blur(8px)', 
        zIndex: 99999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose();
      }}
    >
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '540px', 
          background: 'var(--bg-card)', 
          borderRadius: '20px', 
          padding: '28px', 
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          border: '1px solid var(--border-light)'
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
            <i className="fa-solid fa-file-excel" style={{ color: '#10b981', fontSize: '1.3rem' }}></i> Tải lên File Excel Môn học
          </h3>
          <button 
            onClick={onClose} 
            disabled={uploading}
            className="btn btn-outline" 
            style={{ border: 'none', fontSize: '1.3rem', padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.55' }}>
          Vui lòng chọn hoặc kéo thả tệp Excel (<code>.xlsx</code> / <code>.xls</code>) chứa danh sách học phần mở. Hệ thống sẽ trích xuất và nạp dữ liệu vào cơ sở dữ liệu MongoDB.
        </p>

        {/* Drag & Drop Input Container */}
        <div 
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            border: selectedFile ? '2px solid #10b981' : '2px dashed #10b981',
            borderRadius: '14px',
            padding: '36px 20px',
            textAlign: 'center',
            background: selectedFile ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.04)',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.25s ease'
          }}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />

          <i className={`fa-solid ${selectedFile ? 'fa-file-circle-check' : 'fa-cloud-arrow-up'} fa-3x`} style={{ color: '#10b981', marginBottom: '12px' }}></i>
          
          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
            {selectedFile ? selectedFile.name : 'Nhấp vào đây để chọn tệp Excel (.xlsx)'}
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Sẵn sàng nạp vào MongoDB` : 'Hỗ trợ tệp 3007_DKGD hoc ky 1 nam hoc 2026_2027 Open.xlsx'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose} 
            disabled={uploading}
            className="btn btn-outline"
            style={{ padding: '9px 18px', fontSize: '0.86rem' }}
          >
            Hủy bỏ
          </button>

          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            className="btn"
            style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              color: '#ffffff', 
              fontWeight: 800, 
              padding: '9px 24px', 
              fontSize: '0.88rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              opacity: (!selectedFile || uploading) ? 0.6 : 1,
              cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Đang nạp vào MongoDB...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i> Gửi tệp & Nạp MongoDB
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExcelUploadModal;
