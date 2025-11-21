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
    const userId = user.id;

    fetch(`http://localhost:5000/api/siswa/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        // Tentukan foto berdasarkan jenis kelamin
        const profilePhoto = data.jenis_kelamin === 'L' ? BoyImg : GirlImg;
        
        setStudentData({
          name: data.nama,
          nis: data.nis,
          class: data.kelas,
          gender: data.jenis_kelamin,
          email: data.email || 'siswa@sdit-alhidayah.sch.id', 
          phone: data.no_hp || '-',
          address: data.alamat || '-',
          joinDate: data.tanggal_masuk || '-',
          photoUrl: profilePhoto // Foto dinamis berdasarkan gender
        });
      })
      .catch(error => console.error("Gagal mengambil data:", error));
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  
  const handleCloseModal = () => { 
    setIsModalOpen(false); 
    setRequestNote(''); 
  };
  
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!requestNote.trim()) {
      alert('Mohon isi keterangan perubahan data!');
      return;
    }
    // TODO: Kirim request ke backend untuk approval admin
    alert(`Permintaan perubahan data telah dikirim ke admin!\n\nKeterangan: ${requestNote}`);
    handleCloseModal();
  };

  if (!studentData) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <p>Sedang memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="dashboard-card profile-header-card">
        <div className="profile-avatar-wrapper">
          <img src={studentData.photoUrl} alt="Foto Profil" className="profile-avatar" />
          <span className="profile-status-badge">Siswa Aktif</span>
        </div>
        <h2 className="profile-name">{studentData.name}</h2>
        <p className="profile-class">Kelas {studentData.class}</p>
        <p style={{color: '#999', fontSize: '14px', marginTop: '5px'}}>
          {studentData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
        </p>
      </div>

      <div className="dashboard-card profile-details-card">
        <h3>Informasi Pribadi</h3>
        <form className="profile-form">
          <div className="form-group">
            <label>NIS</label>
            <input type="text" value={studentData.nis} readOnly />
          </div>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input type="text" value={studentData.name} readOnly />
          </div>
          <div className="form-group">
            <label>Jenis Kelamin</label>
            <input 
              type="text" 
              value={studentData.gender === 'L' ? 'Laki-laki' : 'Perempuan'} 
              readOnly 
            />
          </div>
          <div className="form-group">
            <label>Kelas</label>
            <input type="text" value={studentData.class} readOnly />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={studentData.email} readOnly />
          </div>
          <div className="form-group">
            <label>No. HP / WA Orang Tua</label>
            <input type="text" value={studentData.phone} readOnly />
          </div>
          <div className="form-group full-width">
            <label>Alamat</label>
            <textarea value={studentData.address} readOnly rows="3"></textarea>
          </div>
        </form>
        <div className="profile-actions">
          <button className="btn-edit" onClick={handleOpenModal}>
            Request Ubah Data
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ajukan Perubahan Data</h3>
            <p style={{color: '#666', marginBottom: '20px', fontSize: '14px'}}>
              Silakan jelaskan data mana yang perlu diubah dan nilai yang benar. Admin akan meninjau permintaan Anda.
            </p>
            <textarea 
              className="modal-textarea" 
              rows="5" 
              value={requestNote} 
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Contoh: No. HP Orang Tua saya yang benar adalah 08123456789, bukan yang tertera di sistem sekarang."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontFamily: 'Poppins',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
            <div className="modal-actions" style={{marginTop: '20px'}}>
              <button className="btn-cancel" onClick={handleCloseModal}>Batal</button>
              <button className="btn-submit" onClick={handleSubmitRequest}>Kirim Permintaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;