import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportCompaniesToExcel } from './excel.utils';
import * as XLSX from 'xlsx';

// 1. XLSX kütüphanesini mockluyoruz (Taklit ediyoruz)
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({ '!cols': [] })), // Sahte sheet
    book_new: vi.fn(() => ({})), // Sahte workbook
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(), // Dosya yazma fonksiyonu
}));

// 2. i18next kütüphanesini mockluyoruz
vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key, // Çeviri yerine anahtarı döndürsün
  }
}));

describe('excel.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Her testten önce sayacı sıfırla
  });

  it('exportCompaniesToExcel fonksiyonu XLSX.writeFile çağırmalı', () => {
    const mockCompanies: any[] = [
      { name: 'Test A.Ş.', createdAt: '2024-01-01' },
      { name: 'Lojistik Ltd.', createdAt: '2024-02-01' }
    ];

    exportCompaniesToExcel(mockCompanies);

    // 1. json_to_sheet çağrıldı mı?
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    
    // 2. Sheet'e ekleme yapıldı mı?
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      expect.anything(), // workbook
      expect.anything(), // worksheet
      'Excel.sheetNames.COMPANIES' // i18next mock'u sayesinde key döndü
    );

    // 3. Dosya kaydetme tetiklendi mi?
    expect(XLSX.writeFile).toHaveBeenCalledTimes(1);
    
    // Dosya adının içinde 'COMPANIES' geçiyor mu?
    const calledFileName = vi.mocked(XLSX.writeFile).mock.calls[0][1];
    expect(calledFileName).toContain('Excel.fileNames.COMPANIES');
  });
});