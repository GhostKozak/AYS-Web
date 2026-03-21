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


export type TripStatus = 'WAITING' | 'UNLOADING' | 'UNLOADED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface TripType {
  _id: string;
  driver: Pick<DriverType, '_id' | 'full_name' | 'phone_number'>;
  company: Pick<CompanyType, '_id' | 'name'>;
  vehicle: Pick<VehicleType, '_id' | 'licence_plate'>;
  departure_time: string;
  arrival_time: string;
  unload_status: TripStatus;
  has_gps_tracking: boolean;
  is_in_temporary_parking_lot: boolean;
  is_in_parking_lot: boolean;
  parked_at?: string;
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
  is_in_parking_lot?: boolean;
  parked_at?: string;
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

export interface CreateUserPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export type DiffChange = {
  key: string;
  oldValue: unknown;
  newValue: unknown;
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
  getOldValue?: (record: T) => unknown;
  getNewValue?: (formValues: F) => unknown;
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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export const USER_ROLES = {
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
  isActive?: boolean;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditType {
  _id: string;
  user: Pick<User, 'firstName' | 'lastName' | 'email' | 'role'> | null;
  userEmail: string; // Fallback for legacy or unpopulated
  action: string;
  entity: string;
  entityId?: string;
  details?: any; // legacy
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}