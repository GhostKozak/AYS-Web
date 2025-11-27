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