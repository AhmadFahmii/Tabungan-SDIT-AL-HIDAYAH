import React, { useState, useEffect } from 'react';
import BoyImg from '../assets/boy.png';
import GirlImg from '../assets/girl.png';

const Profil = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) return;

    const user = JSON.parse(userString);
    const userId = user.id; // Hapus Fallback ke 1

    fetch(`http://localhost:5000/api/siswa/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setStudentData({
          name: data.nama,
          nis: data.nis,
          class: data.kelas,
          email: 'siswa@sdit-alhidayah.sch.id', 
          phone: data.no_hp,
          address: data.alamat,
          joinDate: '20 April 2024',
          photoUrl: FotoProfil 
        });
      })
      .catch(error => console.error("Gagal mengambil data:", error));
  }, []);

  // ... (Sisa kode sama, hanya pastikan studentData digunakan) ...

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => { setIsModalOpen(false); setRequestNote(''); };
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    alert(`Permintaan dikirim: ${requestNote}`);
    handleCloseModal();
  };

  if (!studentData) return <div style={{padding: '20px'}}>Sedang memuat data profil...</div>;

  return (
    <div className="profile-container">
      <div className="dashboard-card profile-header-card">
        <div className="profile-avatar-wrapper">
          <img src={studentData.photoUrl} alt="Foto Profil" className="profile-avatar" />
          <span className="profile-status-badge">Siswa Aktif</span>
        </div>
        <h2 className="profile-name">{studentData.name}</h2>
        <p className="profile-class">Kelas {studentData.class}</p>
      </div>

      <div className="dashboard-card profile-details-card">
        <h3>Informasi Pribadi</h3>
        <form className="profile-form">
          <div className="form-group"><label>NIS</label><input type="text" value={studentData.nis} readOnly /></div>
          <div className="form-group"><label>Nama Lengkap</label><input type="text" value={studentData.name} readOnly /></div>
          <div className="form-group"><label>Email</label><input type="email" value={studentData.email} readOnly /></div>
          <div className="form-group"><label>No. HP / WA</label><input type="text" value={studentData.phone} readOnly /></div>
          <div className="form-group full-width"><label>Alamat</label><textarea value={studentData.address} readOnly rows="3"></textarea></div>
        </form>
        <div className="profile-actions">
            <button className="btn-edit" onClick={handleOpenModal}>Request Ubah Data</button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ajukan Perubahan Data</h3>
            <p>Silakan jelaskan data mana yang salah.</p>
            <textarea className="modal-textarea" rows="4" value={requestNote} onChange={(e) => setRequestNote(e.target.value)}></textarea>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleCloseModal}>Batal</button>
              <button className="btn-submit" onClick={handleSubmitRequest}>Kirim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;