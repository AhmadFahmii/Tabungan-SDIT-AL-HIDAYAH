import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (title, headers, data, fileName) => {
  const doc = new jsPDF();

  // 1. Judul Laporan
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.text("SDIT AL-HIDAYAH", 14, 30);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

  // 2. Membuat Tabel
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 45, // Jarak tabel dari atas
    theme: 'grid', // Tema tabel (striped, grid, plain)
    headStyles: { fillColor: [74, 20, 140] }, // Warna header (Ungu)
    styles: { fontSize: 10, cellPadding: 3 },
  });

  // 3. Simpan File
  doc.save(`${fileName}.pdf`);
};