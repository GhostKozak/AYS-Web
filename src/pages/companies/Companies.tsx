import { Layout, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

interface CompanyType {
  _id: string;
  name: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const columns: ColumnsType<CompanyType> = [
  {
    title: 'Şirket Adı',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Eklenme Tarihi',
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
    title: 'Değiştirilme Tarihi',
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
    title: 'Durum',
    key: 'deleted',
    dataIndex: 'deleted',
    render: (deleted: boolean) => {
      const color = deleted ? 'red' : 'green';
      const text = deleted ? 'Pasif' : 'Aktif';
      return (
        <Tag color={color}>
          {text}
        </Tag>
      );
    },
  },
  {
    title: 'İşlemler',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Düzenle</a>
        <a>Sil</a>
      </Space>
    ),
  },
];

function Companies() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/companies');
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Şirketler yüklenirken hata oluştu:', error);
      message.error('Şirketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <Layout style={{ padding: "0 50px" }}>
      <Table 
        columns={columns} 
        dataSource={companies} 
        loading={loading}
        rowKey="_id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} şirket`,
        }}
      />
    </Layout>
  )
}

export default Companies