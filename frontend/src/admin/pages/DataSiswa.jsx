import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaUserGraduate, FaFilter, FaEdit } from 'react-icons/fa';
import { fetchWithAuth } from '../../utils/api'; 

const DataSiswa = () => {
  const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterGrade, setFilterGrade] = useState('all'); 
  const [formData, setFormData] = useState({
    nis: '', nama: '', jenis_kelamin: 'L', kelas: '', no_hp: '', alamat: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 1. Fetch Data dengan Wrapper Auth
  const fetchStudents = () => {
    fetchWithAuth('http://localhost:5000/api/admin/students')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setStudents(data); })
      .catch(err => console.error(err));
  };

  const fetchClasses = () => {
    fetchWithAuth('http://localhost:5000/api/admin/kelas')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setClassList(data); })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses(); 
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (student) => {
    setIsEditing(true);
    setEditingId(student.id);
    setFormData({
        nis: student.nis,
        nama: student.nama,
        jenis_kelamin: student.jenis_kelamin || 'L',
        kelas: student.kelas,
        no_hp: student.no_hp || '', 
        alamat: student.alamat || ''
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nis: '', nama: '', jenis_kelamin: 'L', kelas: '', no_hp: '', alamat: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing 
        ? `http://localhost:5000/api/admin/students/${editingId}`
        : 'http://localhost:5000/api/admin/students';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      // Gunakan fetchWithAuth untuk request update/add
      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(formData), // Content-Type sudah di-handle oleh helper
      });
      const result = await response.json();

      if (response.ok) {
        alert(isEditing ? "✅ Data Siswa Diupdate!" : "✅ Siswa Baru Ditambahkan!");
        setIsModalOpen(false);
        fetchStudents(); 
      } else {
        alert("❌ Gagal: " + result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStudents = students.filter(s => {
    const name = s.nama ? s.nama.toLowerCase() : '';
    const nis = s.nis ? s.nis.toString() : '';
    const className = s.kelas ? s.kelas : '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || nis.includes(searchTerm);
    const matchesGrade = filterGrade === 'all' || className.startsWith(filterGrade);
    return matchesSearch && matchesGrade;
  });

  // ... (return JSX sama persis seperti sebelumnya) ...
  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{color: '#333', margin: 0}}>Kelola Data Siswa</h2>
        <button className="btn-submit" onClick={handleAddClick} style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}><FaPlus /> Tambah Siswa</button>
      </div>

      <div className="dashboard-card table-card">
        <div style={{padding: '20px', borderBottom: '1px solid #eee', display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
          <div className="search-box" style={{flex: 2, minWidth: '200px'}}>
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Cari Nama atau NIS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div style={{flex: 1, minWidth: '150px', position: 'relative'}}>
            <FaFilter style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none'}} />
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={{width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', border: '1px solid #e0e0e0', fontFamily: 'Poppins', cursor: 'pointer', backgroundColor: 'white', outline: 'none', color: '#333'}}>
              <option value="all">Semua Kelas</option>
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="transaction-table">
            <thead>
              <tr>
                <th style={{paddingLeft: '24px'}}>NIS</th>
                <th>Nama Lengkap</th>
                <th style={{textAlign: 'center'}}>L/P</th>
                <th style={{textAlign: 'center'}}>Kelas</th>
                <th style={{textAlign: 'right', paddingRight: '30px'}}>Saldo</th>
                <th style={{textAlign: 'center', width: '80px', paddingRight: '24px'}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td style={{paddingLeft: '24px'}}><span className="tx-id" style={{fontSize: '14px', fontWeight: '600', color: '#555'}}>{s.nis}</span></td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div className="tx-icon-circle" style={{backgroundColor: '#e3f2fd', color: '#1565C0', width: '35px', height: '35px', fontSize: '14px'}}><FaUserGraduate /></div>
                        <span className="tx-desc" style={{fontWeight: '500', color: '#333'}}>{s.nama}</span>
                      </div>
                    </td>
                    <td style={{textAlign: 'center'}}>
                        <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.jenis_kelamin === 'L' ? '#E3F2FD' : '#FCE4EC', color: s.jenis_kelamin === 'L' ? '#1565C0' : '#C2185B'}}>{s.jenis_kelamin === 'L' ? 'L' : 'P'}</span>
                    </td>
                    <td style={{textAlign: 'center'}}><span className="badge-status pending" style={{color: '#333', backgroundColor: '#f5f5f5', border: '1px solid #ddd'}}>{s.kelas}</span></td>
                    <td style={{textAlign: 'right', paddingRight: '30px', fontWeight: 'bold', color: '#2E7D32', fontSize: '15px'}}>Rp {s.saldo ? s.saldo.toLocaleString('id-ID') : 0}</td>
                    <td style={{textAlign: 'center', paddingRight: '24px'}}>
                        <button onClick={() => handleEditClick(s)} style={{border: 'none', background: '#ffb300', color: '#fff', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}} title="Edit Data Siswa"><FaEdit /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="empty-state">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '650px', width: '90%'}}>
            <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', color: '#333'}}>{isEditing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <form className="profile-form" onSubmit={handleSubmit}>
              <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                <div className="form-group" style={{flex: 1}}><label>NIS</label><input type="text" name="nis" value={formData.nis} onChange={handleInputChange} required placeholder="Contoh: 2024001" style={{width: '100%', boxSizing: 'border-box'}} /></div>
                <div className="form-group" style={{flex: 1}}><label>Nama Lengkap</label><input type="text" name="nama" value={formData.nama} onChange={handleInputChange} required placeholder="Nama Siswa" style={{width: '100%', boxSizing: 'border-box'}} /></div>
              </div>
              <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                <div className="form-group" style={{flex: 1}}><label>Jenis Kelamin</label><select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} required style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontFamily: 'Poppins', backgroundColor: 'white', color: '#333', outline: 'none', boxSizing: 'border-box', cursor: 'pointer'}}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                <div className="form-group" style={{flex: 1}}><label>Kelas</label><select name="kelas" value={formData.kelas} onChange={handleInputChange} required style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontFamily: 'Poppins', backgroundColor: 'white', color: '#333', outline: 'none', boxSizing: 'border-box', cursor: 'pointer'}}><option value="">-- Pilih Kelas --</option>{classList.map((cls) => (<option key={cls.id} value={cls.nama_kelas}>{cls.nama_kelas}</option>))}</select></div>
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}><label>No. HP / WA Orang Tua</label><input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} placeholder="08xxxxxxxxxx" style={{width: '100%', boxSizing: 'border-box'}} /></div>
              <div className="form-group full-width" style={{marginBottom: '20px'}}><label>Alamat</label><textarea name="alamat" rows="3" value={formData.alamat} onChange={handleInputChange} style={{width: '100%', boxSizing: 'border-box', resize: 'none'}}></textarea></div>
              <div className="modal-actions" style={{borderTop: '1px solid #eee', paddingTop: '20px'}}>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-submit" style={{backgroundColor: isEditing ? '#ffb300' : '#4a148c', color: isEditing ? '#333' : '#fff'}}>{isEditing ? 'Update Data' : 'Simpan Data'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSiswa;