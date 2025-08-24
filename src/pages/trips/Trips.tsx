import { Empty, Layout, Space, Table, Tag, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../constants';

function Trips() {
  const [trips, setTrips] = useState<TripType[]>([]);
  const [loading, setLoading] = useState(false);
  const {t,i18n} = useTranslation();

  interface TripType {
    _id: string;
    driver: {
      _id: string;
      full_name: string;
      phone_number: string;
    };
    company: {
      _id: string;
      name: string;
    };
    vehicle: {
      _id: string;
      licence_plate: string;
    };
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
  
  const formatLicencePlate = (plate: string): string => {
    // Add space between letters and numbers
    return plate.replace(/([A-Z]+)(\d+)/g, '$1 $2').replace(/(\d+)([A-Z]+)/g, '$1 $2');
  };
  
  const formatPhoneNumber = (phone_number: string): string => {
    const cleanNumber = String(phone_number).replace(/\D/g, '');
  
    if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
      const [, countryCode, ...rest] = cleanNumber.split('');
      const areaCode = rest.slice(0, 3).join('');
      const prefix = rest.slice(3, 6).join('');
      const suffix = rest.slice(6, 8).join('');
      const lastTwo = rest.slice(8, 10).join('');
      
      return `${countryCode}${areaCode} ${prefix} ${suffix} ${lastTwo}`;
    }
  
    if (cleanNumber.length === 10) {
      const [, ...rest] = `0${cleanNumber}`.split('');
      const areaCode = rest.slice(0, 3).join('');
      const prefix = rest.slice(3, 6).join('');
      const suffix = rest.slice(6, 8).join('');
      const lastTwo = rest.slice(8, 10).join('');
  
      return `0${areaCode} ${prefix} ${suffix} ${lastTwo}`;
    }
    
    return phone_number;
  }
  
  const columns: ColumnsType<TripType> = [
    {
      title: t("Trips.ARRIVAL_TIME"),
      dataIndex: 'arrival_time',
      key: 'arrival_time',
      render: (date: string) => new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    },
    {
      title: t("Trips.FULL_NAME"),
      dataIndex: 'driver',
      key: 'driver',
      render: (driver: { _id: string; full_name: string }) => driver?.full_name || 'Sürücü bulunamadı',
    },
    {
      title: t("Trips.PHONE_NUMBER"),
      dataIndex: 'driver',
      key: 'driver',
      render: (driver: { _id: string; phone_number: string }) => formatPhoneNumber(driver?.phone_number) || 'Sürücü bulunamadı',
    },
    {
      title: t("Trips.COMPANY_NAME"),
      dataIndex: 'company',
      key: 'company',
      render: (company: { _id: string; name: string }) => company?.name || 'Şirket bulunamadı',
    },
    {
      title: t("Trips.LICENSE_PLATE"),
      dataIndex: 'vehicle',
      key: 'vehicle',
      render: (vehicle: { _id: string; licence_plate: string }) => formatLicencePlate(vehicle?.licence_plate) || 'Şirket bulunamadı',
    },
    {
      title: t("Trips.UNLOAD_STATUS"),
      dataIndex: 'unload_status',
      key: 'unload_status',
    },
    {
      title: 'ATS',
      dataIndex: 'has_gps_tracking',
      key: 'has_gps_tracking',
      render: (has_gps_tracking: boolean) => {
        const color = has_gps_tracking ? 'green' : 'red';
        const text = has_gps_tracking ? 'Var' : 'Yok';
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: (
        <Tooltip title="Koridor Kesik">
          <span>KK</span>
        </Tooltip>
      ),
      dataIndex: 'is_in_temporary_parking_lot',
      key: 'is_in_temporary_parking_lot',
      render: (is_in_temporary_parking_lot: boolean) => {
        const color = is_in_temporary_parking_lot ? 'green' : '';
        const text = is_in_temporary_parking_lot ? 'Kesik' : '';
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: t("Trips.TRIP_CANCELED"),
      dataIndex: 'is_trip_canceled',
      key: 'is_trip_canceled',
      render: (is_trip_canceled: boolean) => {
        const color = is_trip_canceled ? 'red' : '';
        const text = is_trip_canceled ? t("Trips.CANCEL") : '';
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    Table.EXPAND_COLUMN,
  ];

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.TRIPS);
      setTrips(response.data.data);
      console.table(response.data.data)
    } catch (error) {
      console.error('Sefer yüklenirken hata oluştu:', error);
      message.error('Sefer yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <Layout style={{ padding: "0 50px" }}>
      <Table 
        columns={columns} 
        dataSource={trips} 
        loading={loading}
        rowKey="_id"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={ t("Table.NO_DATA") }
            />
          )
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sefer`,
        }}
        expandable={{
          expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.notes}</p>,
          rowExpandable: (record) => !!record.notes && record.notes !== '',
        }}
      />
    </Layout>
  )
}

export default Trips