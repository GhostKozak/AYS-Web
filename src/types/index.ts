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
    vehicle_type: VehiclesType;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type VehiclesType = 'TRUCK' | 'LORRY' | 'VAN' | 'TRAILER';

export const VehicleValues: VehiclesType[] = [
  'TRUCK',
  'LORRY',
  'VAN',
  'TRAILER',
];

export const VehicleLabels: Record<VehiclesType, string> = {
  TRUCK: 'Tır',
  LORRY: 'Lorry Kamyonet',
  VAN: 'Minivan',
  TRAILER: 'Dorse',
};