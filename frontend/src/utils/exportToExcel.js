import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  // 1. Membuat Worksheet baru dari data JSON
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Membuat Workbook baru (buku kerja Excel)
  const workbook = XLSX.utils.book_new();

  // 3. Menambahkan Worksheet ke dalam Workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // 4. Menulis file dan memicu download browser
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};