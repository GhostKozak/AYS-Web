import { Empty, Layout, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

function Drivers() {
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation();

  interface DriverType {
    _id: string;
    company: {
      _id: string;
      name: string;
    };
    full_name: string;
    phone_number: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
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
  
  const columns: ColumnsType<DriverType> = [
    {
      title: t("Drivers.FULL_NAME"),
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: t("Drivers.PHONE_NUMBER"),
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (phone_number: string) => formatPhoneNumber(phone_number),
    },
    {
      title: t("Drivers.COMPANY_NAME"),
      dataIndex: 'company',
      key: 'company',
      render: (company: { _id: string; name: string }) => company?.name || 'Şirket bulunamadı',
    },
    {
      title: t("Drivers.CREATED_AT"),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    },
    {
      title: t("Drivers.UPDATED_AT"),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    },
    {
      title: t("Drivers.STATUS"),
      key: 'deleted',
      dataIndex: 'deleted',
      render: (deleted: boolean) => {
        const color = deleted ? 'red' : 'green';
        const text = deleted ? t("Drivers.PASSIVE") : t("Drivers.ACTIVE");
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: t("Drivers.ACTIONS"),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>{t("Drivers.EDIT")}</a>
          <a>{t("Drivers.DELETE")}</a>
        </Space>
      ),
    },
  ];

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/drivers');
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Sürücüler yüklenirken hata oluştu:', error);
      message.error('Sürücüler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <Layout style={{ padding: "0 50px" }}>
      <Table 
        columns={columns} 
        dataSource={drivers} 
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
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sürücü`,
        }}
      />
    </Layout>
  )
}

export default Drivers