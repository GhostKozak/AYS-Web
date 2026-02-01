import * as XLSX from 'xlsx';
import i18next from 'i18next';
import type { TripType, CompanyType, DriverType, VehicleType } from '../types';

// Ortak Kaydetme Fonksiyonu
const saveAsExcel = (data: any[], fileNameKey: string, sheetName: string, colWidths: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = colWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Dosya Adı Çevirisi
  const baseName = i18next.t(`Excel.fileNames.${fileNameKey}`);
  const dateStr = new Date().toLocaleDateString('tr-TR').replace(/\./g, '_');
  const fullFileName = `${baseName}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fullFileName);
};

// 1. SEFERLER
export const exportTripsToExcel = (trips: TripType[]) => {
  const data = trips.map((trip) => ({
    [i18next.t('Excel.columns.COMPANY')]: trip.company?.name || '-',
    [i18next.t('Excel.columns.PLATE')]: trip.vehicle?.licence_plate || '-',
    [i18next.t('Excel.columns.DRIVER')]: trip.driver?.full_name || '-',
    [i18next.t('Excel.columns.PHONE')]: trip.driver?.phone_number || '-',
    [i18next.t('Excel.columns.ARRIVAL')]: trip.arrival_time ? new Date(trip.arrival_time).toLocaleString('tr-TR') : '-',
    [i18next.t('Excel.columns.DEPARTURE')]: trip.departure_time ? new Date(trip.departure_time).toLocaleString('tr-TR') : '-',
    [i18next.t('Excel.columns.STATUS')]: i18next.t(`Excel.status.${trip.unload_status}`),
    [i18next.t('Excel.columns.GPS')]: trip.has_gps_tracking ? i18next.t('Excel.boolean.EXIST') : i18next.t('Excel.boolean.MISSING'),
    [i18next.t('Excel.columns.PARKING')]: trip.is_in_temporary_parking_lot ? i18next.t('Excel.boolean.YES') : i18next.t('Excel.boolean.NO'),
    [i18next.t('Excel.columns.NOTES')]: trip.notes || ''
  }));
  
  saveAsExcel(data, 'TRIPS', i18next.t('Excel.sheetNames.TRIPS'), [
    { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
  ]);
};

// 2. FİRMALAR
export const exportCompaniesToExcel = (companies: CompanyType[]) => {
  const data = companies.map((c) => ({
    [i18next.t('Excel.columns.COMPANY')]: c.name,
    [i18next.t('Excel.columns.CREATED_AT')]: new Date(c.createdAt).toLocaleDateString('tr-TR')
  }));

  saveAsExcel(data, 'COMPANIES', i18next.t('Excel.sheetNames.COMPANIES'), [{ wch: 40 }, { wch: 20 }]);
};

// 3. SÜRÜCÜLER
export const exportDriversToExcel = (drivers: DriverType[]) => {
  const data = drivers.map((d) => ({
    [i18next.t('Excel.columns.DRIVER')]: d.full_name,
    [i18next.t('Excel.columns.PHONE')]: d.phone_number,
    [i18next.t('Excel.columns.COMPANY')]: d.company?.name || '-',
    [i18next.t('Excel.columns.CREATED_AT')]: new Date(d.createdAt).toLocaleDateString('tr-TR')
  }));

  saveAsExcel(data, 'DRIVERS', i18next.t('Excel.sheetNames.DRIVERS'), [
    { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
  ]);
};

// 4. ARAÇLAR
export const exportVehiclesToExcel = (vehicles: VehicleType[]) => {
  const data = vehicles.map((v) => ({
    [i18next.t('Excel.columns.PLATE')]: v.licence_plate,
    [i18next.t('Excel.columns.VEHICLE_TYPE')]: i18next.t(`Excel.vehicleTypes.${v.vehicle_type}`),
    [i18next.t('Excel.columns.CREATED_AT')]: new Date(v.createdAt).toLocaleDateString('tr-TR')
  }));

  saveAsExcel(data, 'VEHICLES', i18next.t('Excel.sheetNames.VEHICLES'), [
    { wch: 15 }, { wch: 15 }, { wch: 15 }
  ]);
};

// 5. GÜNLÜK RAPOR
export const exportDailyDashboard = (trips: TripType[]) => {
  const todayStr = new Date().toLocaleDateString('tr-TR');

  const todaysTrips = trips.filter((trip) => {
    if (!trip.arrival_time) return false;
    return new Date(trip.arrival_time).toLocaleDateString('tr-TR') === todayStr;
  });

  const data = todaysTrips.map((trip) => ({
    [i18next.t('Excel.columns.PLATE')]: trip.vehicle?.licence_plate || '-',
    [i18next.t('Excel.columns.COMPANY')]: trip.company?.name || '-',
    [i18next.t('Excel.columns.DRIVER')]: trip.driver?.full_name || '-',
    [i18next.t('Excel.columns.ARRIVAL')]: trip.arrival_time ? new Date(trip.arrival_time).toLocaleTimeString('tr-TR') : '-',
    [i18next.t('Excel.columns.STATUS')]: i18next.t(`Excel.status.${trip.unload_status}`),
    [i18next.t('Excel.columns.PARKING')]: trip.is_in_temporary_parking_lot ? i18next.t('Excel.boolean.YES') : i18next.t('Excel.boolean.NO'),
    [i18next.t('Excel.columns.NOTES')]: trip.notes || ''
  }));

  saveAsExcel(data, 'DAILY_REPORT', i18next.t('Excel.sheetNames.DAILY_REPORT'), [
    { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 30 }
  ]);
};