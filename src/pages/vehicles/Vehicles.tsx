import { Empty, Layout, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const {t,i18n} = useTranslation();

  interface VehicleType {
    _id: string;
    licence_plate: string;
    vehicle_type: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  const formatLicencePlate = (plate: string): string => {
    // Add space between letters and numbers
    return plate.replace(/([A-Z]+)(\d+)/g, '$1 $2').replace(/(\d+)([A-Z]+)/g, '$1 $2');
  };
  
  const columns: ColumnsType<VehicleType> = [
    {
      title: t("Vehicles.LICENSE_PLATE"),
      dataIndex: 'licence_plate',
      key: 'licence_plate',
      render: (plate: string) => formatLicencePlate(plate),
    },
    {
      title: t("Vehicles.VEHICLE_TYPE"),
      dataIndex: 'vehicle_type',
      key: 'vehicle_type'
    },
    {
      title: t("Vehicles.CREATED_AT"),
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
      title: t("Vehicles.UPDATED_AT"),
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
      title: t("Vehicles.STATUS"),
      key: 'deleted',
      dataIndex: 'deleted',
      render: (deleted: boolean) => {
        const color = deleted ? 'red' : 'green';
        const text = deleted ? t("Vehicles.PASSIVE") : t("Vehicles.ACTIVE");
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: t("Vehicles.ACTIONS"),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>{t("Vehicles.EDIT")}</a>
          <a>{t("Vehicles.DELETE")}</a>
        </Space>
      ),
    },
  ];

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Araçlar yüklenirken hata oluştu:', error);
      message.error('Araçlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <Layout style={{ padding: "0 50px" }}>
      <Table 
        columns={columns} 
        dataSource={vehicles} 
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
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} araç`,
        }}
      />
    </Layout>
  )
}

export default Vehicles