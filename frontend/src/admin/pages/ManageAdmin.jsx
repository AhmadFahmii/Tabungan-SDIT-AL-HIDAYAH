import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUserShield } from 'react-icons/fa';

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: ''
  });

  const token = localStorage.getItem('token');

  // 1. Fetch Data Admin
  const fetchAdmins = () => {
    fetch('https://tabungansdital-hidayah-anbaaua8hwf5fnb6.indonesiacentral-01.azurewebsites.net/api/admin/accounts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          if(Array.isArray(data)) setAdmins(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (token) fetchAdmins();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://tabungansdital-hidayah-anbaaua8hwf5fnb6.indonesiacentral-01.azurewebsites.net/api/admin/accounts', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        alert("✅ Admin Baru Ditambahkan!");
        setIsModalOpen(false);
        setFormData({ username: '', password: '', nama_lengkap: '' }); 
        fetchAdmins(); 
      } else {
        alert("❌ Gagal: " + result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Yakin ingin menghapus admin ini?")) return;

    try {
        const response = await fetch(`https://tabungansdital-hidayah-anbaaua8hwf5fnb6.indonesiacentral-01.azurewebsites.net/api/admin/accounts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
            alert("Admin dihapus.");
            fetchAdmins();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{color: '#333', margin: 0}}>Manajemen Admin</h2>
        <button className="btn-submit" onClick={() => setIsModalOpen(true)} style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <FaPlus /> Tambah Admin
        </button>
      </div>

      <div className="dashboard-card table-card">
        <div className="table-responsive">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Dibuat Pada</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div className="tx-icon-circle" style={{backgroundColor: '#E3F2FD', color: '#1565C0'}}>
                            <FaUserShield />
                        </div>
                        <span style={{fontWeight: '600'}}>{admin.username}</span>
                    </div>
                  </td>
                  <td>{admin.nama_lengkap}</td>
                  <td>{new Date(admin.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="text-right">
                    <button 
                        onClick={() => handleDelete(admin.id)}
                        style={{
                            border: 'none', 
                            background: '#ffebee', 
                            color: '#d32f2f', 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            cursor: 'pointer'
                        }}
                    >
                        <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Admin */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px'}}>
            <h3>Tambah Admin Baru</h3>
            <form className="profile-form" onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required placeholder="Nama Lengkap Guru/Staf" />
              </div>

              <div className="form-group">
                <label>Username (Untuk Login)</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required placeholder="username_admin" />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="******" />
              </div>
              
              <div className="modal-actions" style={{marginTop: '20px'}}>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAdmin;