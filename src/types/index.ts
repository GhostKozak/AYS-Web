export interface CompanyType {
    _id: string;
    name: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface DriverType {
  _id: string;
  company: Pick<CompanyType, '_id' | 'name'>; 
  full_name: string;
  phone_number: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VehicleType {
  _id: string;
  licence_plate: string;
  vehicle_type: VehicleTypeEnum;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type VehicleTypeEnum = 'TRUCK' | 'LORRY' | 'VAN' | 'TRAILER';

export const VehicleValues: VehicleTypeEnum[] = [
  'TRUCK',
  'LORRY',
  'VAN',
  'TRAILER',
];

export const VehicleLabels: Record<VehicleTypeEnum, string> = {
  TRUCK: 'Tır',
  LORRY: 'Lorry Kamyonet',
  VAN: 'Minivan',
  TRAILER: 'Dorse',
};

export interface TripType {
  _id: string;
  driver: Pick<DriverType, '_id' | 'full_name' | 'phone_number'>;
  company: Pick<CompanyType, '_id' | 'name'>;
  vehicle: Pick<VehicleType, '_id' | 'licence_plate'>;
  departure_time: string;
  arrival_time: string;
  unload_status: string;
  has_gps_tracking: boolean;
  is_in_temporary_parking_lot: boolean;
  is_trip_canceled: boolean;
  notes: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateTripPayload {
  company: string; // ID
  vehicle: string; // ID
  driver?: string; // ID
  driver_full_name: string;
  driver_phone_number: string;
  departure_time?: string;
  arrival_time?: string;
  unload_status?: string;
  has_gps_tracking?: boolean;
  is_in_temporary_parking_lot?: boolean;
  is_trip_canceled?: boolean;
  notes?: string;
}

export interface CreateDriverPayload {
  full_name: string;
  phone_number: string;
  company: string; // ID string
}

export interface CreateVehiclePayload {
  licence_plate: string;
  vehicle_type: VehicleTypeEnum;
}

export interface CreateCompanyPayload {
  name: string;
}

export type DiffChange = {
  key: string;
  oldValue: any;
  newValue: any;
};

export type DiffConfigItem<T, F> = {
  label?: string;

  // 1. YÖNTEM: Basit Key Eşleşmesi
  // DB ve Form key'leri aynıysa sadece 'key' yeterli
  key?: keyof T;

  // 2. YÖNTEM: Farklı Keyler
  dbKey?: keyof T; // Veritabanındaki alan adı
  formKey?: keyof F; // Formdaki alan adı

  // 3. YÖNTEM: Özel Dönüştürücüler (ID -> İsim gibi durumlar için)
  // Veriyi okurken işlemek isterseniz bunları kullanırsınız
  getOldValue?: (record: T) => any;
  getNewValue?: (formValues: F) => any;
};

export type DailyStat = {
  date: string;
  dayName: string;
  WAITING: number;
  COMPLETED: number;
  UNLOADED: number;
  CANCELED: number;
  UNKNOWN: number;
  [key: string]: string | number; 
};

export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

export const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  USER: 'user',
} as const;

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}