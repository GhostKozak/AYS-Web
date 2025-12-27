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