import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 
import { FaCalendarAlt } from 'react-icons/fa'; 
import { fetchWithAuth } from '../../utils/api'; 

const InputTransaksi = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({ siswa_id: '', tipe: 'masuk', jumlah: '', keterangan: '' });

  useEffect(() => {
    fetchWithAuth('http://localhost:5000/api/admin/students')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStudents(data); })
      .catch(err => console.error("Gagal ambil siswa:", err));
  }, []);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.siswa_id || !formData.jumlah) return alert("Mohon lengkapi semua data!");
    setLoading(true);

    const offset = selectedDate.getTimezoneOffset();
    const dateLocal = new Date(selectedDate.getTime() - (offset*60*1000));
    const formattedDate = dateLocal.toISOString().split('T')[0];
    const dataToSend = { ...formData, tanggal: formattedDate };

    try {
      const response = await fetchWithAuth('http://localhost:5000/api/admin/transaksi', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (response.ok) {
        alert(`✅ SETORAN BERHASIL! \n${result.message}`);
        setFormData({ ...formData, jumlah: '', keterangan: '' });
        setSelectedDate(new Date()); 
      } else {
        alert(`❌ GAGAL: ${result.message}`);
      }
    } catch (error) { console.error("Error submit:", error); alert("Error koneksi"); } 
    finally { setLoading(false); }
  };

  // ... (return JSX sama, tidak berubah)
  return (
    <div>
      <h2 style={{marginBottom: '20px', color: '#2E7D32'}}>Setor Tunai</h2>
      <div className="dashboard-card" style={{maxWidth: '600px', borderTop: '4px solid #2E7D32'}}>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tanggal Setor</label>
            <div className="custom-datepicker-wrapper" style={{position: 'relative', zIndex: 1001}}>
              <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="dd MMMM yyyy" className="form-control-datepicker" wrapperClassName="date-picker-full-width" popperPlacement="bottom-start" />
              <FaCalendarAlt style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none', zIndex: 1}} />
            </div>
          </div>
          <div className="form-group">
            <label>Pilih Siswa</label>
            <select name="siswa_id" value={formData.siswa_id} onChange={handleChange} style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%'}} required>
              <option value="">-- Cari Nama Siswa --</option>
              {students.map((s) => (<option key={s.id} value={s.id}>{s.nama} - {s.kelas} (Saldo: Rp {s.saldo ? s.saldo.toLocaleString('id-ID') : 0})</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Nominal Setoran (Rp)</label>
            <input type="number" name="jumlah" placeholder="Contoh: 50000" value={formData.jumlah} onChange={handleChange} required min="1000" style={{borderColor: '#2E7D32'}} />
          </div>
          <div className="form-group">
            <label>Keterangan (Opsional)</label>
            <input type="text" name="keterangan" placeholder="Contoh: Tabungan Mingguan / Uang Buku" value={formData.keterangan} onChange={handleChange} />
          </div>
          <div style={{marginTop: '20px'}}>
            <button type="submit" className="btn-submit" style={{width: '100%', padding: '15px', fontSize: '16px', opacity: loading ? 0.7 : 1, backgroundColor: '#2E7D32'}} disabled={loading}>{loading ? 'Sedang Memproses...' : 'SETOR SALDO'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputTransaksi;