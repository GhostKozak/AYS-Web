import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import i18next from 'i18next';
import type { TripType, CompanyType, DriverType, VehicleType } from '../types';
import { isSameDay } from './date.utils';

// Ortak Kaydetme Fonksiyonu
const saveAsExcel = async (data: any[], fileNameKey: string, sheetName: string, colWidths: { width: number }[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Başlıkları ekle
  if (data.length > 0) {
    const columns = Object.keys(data[0]).map((key, index) => ({
      header: key,
      key: key,
      width: colWidths[index]?.width || 20
    }));
    worksheet.columns = columns;

    // Verileri ekle
    worksheet.addRows(data);

    // Genel Stil Ayarları (Font: Calibri, 11pt)
    worksheet.getRows(1, worksheet.rowCount)?.forEach(row => {
      row.font = { name: 'Calibri', size: 11 };
      row.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Başlık (Header) Stili
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' } // Koyu Mavi (Premium Excel Görünümü)
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Kenarlıklar ekle
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };
      });
    });
  }

  // Dosya Adı Çevirisi
  const baseName = i18next.t(`Excel.fileNames.${fileNameKey}`);
  const currentLocale = i18next.language === 'en' ? 'en-US' : 'tr-TR';
  const dateStr = new Date().toLocaleDateString(currentLocale).replace(/[/.]/g, '_');
  const fullFileName = `${baseName}_${dateStr}.xlsx`;

  // Yaz ve Kaydet
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fullFileName);
};

// 1. SEFERLER
export const exportTripsToExcel = (trips: TripType[]) => {
  const currentLocale = i18next.language === 'en' ? 'en-US' : 'tr-TR';
  const data = trips.map((trip) => ({
    [i18next.t('Excel.columns.COMPANY')]: trip.company?.name || '-',
    [i18next.t('Excel.columns.PLATE')]: trip.vehicle?.licence_plate || '-',
    [i18next.t('Excel.columns.DRIVER')]: trip.driver?.full_name || '-',
    [i18next.t('Excel.columns.PHONE')]: trip.driver?.phone_number || '-',
    [i18next.t('Excel.columns.ARRIVAL')]: trip.arrival_time ? new Date(trip.arrival_time).toLocaleString(currentLocale) : '-',
    [i18next.t('Excel.columns.DEPARTURE')]: trip.departure_time ? new Date(trip.departure_time).toLocaleString(currentLocale) : '-',
    [i18next.t('Excel.columns.STATUS')]: i18next.t(`Excel.status.${trip.unload_status}`),
    [i18next.t('Excel.columns.GPS')]: trip.has_gps_tracking ? i18next.t('Excel.boolean.EXIST') : i18next.t('Excel.boolean.MISSING'),
    [i18next.t('Excel.columns.PARKING')]: trip.is_in_temporary_parking_lot ? i18next.t('Excel.boolean.YES') : i18next.t('Excel.boolean.NO'),
    [i18next.t('Excel.columns.NOTES')]: trip.notes || ''
  }));
  
  saveAsExcel(data, 'TRIPS', i18next.t('Excel.sheetNames.TRIPS'), [
    { width: 25 }, { width: 15 }, { width: 25 }, { width: 15 }, { width: 25 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 40 }
  ]);
};

// 2. FİRMALAR
export const exportCompaniesToExcel = (companies: CompanyType[]) => {
  const currentLocale = i18next.language === 'en' ? 'en-US' : 'tr-TR';
  const data = companies.map((c) => ({
    [i18next.t('Excel.columns.COMPANY')]: c.name,
    [i18next.t('Excel.columns.CREATED_AT')]: new Date(c.createdAt).toLocaleDateString(currentLocale)
  }));

  saveAsExcel(data, 'COMPANIES', i18next.t('Excel.sheetNames.COMPANIES'), [{ width: 45 }, { width: 20 }]);
};

// 3. SÜRÜCÜLER
export const exportDriversToExcel = (drivers: DriverType[]) => {
  const currentLocale = i18next.language === 'en' ? 'en-US' : 'tr-TR';
  const data = drivers.map((d) => ({
    [i18next.t('Excel.columns.DRIVER')]: d.full_name,
    [i18next.t('Excel.columns.PHONE')]: d.phone_number,
    [i18next.t('Excel.columns.COMPANY')]: d.company?.name || '-',
    [i18next.t('Excel.columns.CREATED_AT')]: new Date(d.createdAt).toLocaleDateString(currentLocale)
  }));

  saveAsExcel(data, 'DRIVERS', i18next.t('Excel.sheetNames.DRIVERS'), [
    { width: 30 }, { width: 20 }, { width: 35 }, { width: 20 }
  ]);
};

// 4. ARAÇLAR
export const exportVehiclesToExcel = (vehicles: VehicleType[]) => {
  const currentLocale = i18next.language === 'en' ? 'en-US' : 'tr-TR';
  const data = vehicles.map((v) => ({
    [i18next.t('Excel.columns.PLATE')]: v.licence_plate,
    [i18next.t('Excel.columns.VEHICLE_TYPE')]: i18next.t(`Excel.vehicleTypes.${v.vehicle_type}`),
    [i18next.t('Excel.columns.CREATED_AT')]: new Date(v.createdAt).toLocaleDateString(currentLocale)
  }));

  saveAsExcel(data, 'VEHICLES', i18next.t('Excel.sheetNames.VEHICLES'), [
    { width: 20 }, { width: 20 }, { width: 20 }
  ]);
};

// 5. GÜNLÜK RAPOR
export const exportDailyDashboard = (trips: TripType[]) => {
  const currentLocale = i18next.language === 'en' ? 'en-US' : 'tr-TR';
  const today = new Date();

  const todaysTrips = trips.filter((trip) => {
    if (!trip.arrival_time) return false;
    return isSameDay(new Date(trip.arrival_time), today);
  });

  const data = todaysTrips.map((trip) => ({
    [i18next.t('Excel.columns.PLATE')]: trip.vehicle?.licence_plate || '-',
    [i18next.t('Excel.columns.COMPANY')]: trip.company?.name || '-',
    [i18next.t('Excel.columns.DRIVER')]: trip.driver?.full_name || '-',
    [i18next.t('Excel.columns.ARRIVAL')]: trip.arrival_time ? new Date(trip.arrival_time).toLocaleTimeString(currentLocale) : '-',
    [i18next.t('Excel.columns.STATUS')]: i18next.t(`Excel.status.${trip.unload_status}`),
    [i18next.t('Excel.columns.PARKING')]: trip.is_in_temporary_parking_lot ? i18next.t('Excel.boolean.YES') : i18next.t('Excel.boolean.NO'),
    [i18next.t('Excel.columns.NOTES')]: trip.notes || ''
  }));

  saveAsExcel(data, 'DAILY_REPORT', i18next.t('Excel.sheetNames.DAILY_REPORT'), [
    { width: 20 }, { width: 30 }, { width: 25 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 40 }
  ]);
};