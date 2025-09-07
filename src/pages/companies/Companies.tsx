import { Empty, Flex, Layout, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../constants';
import Search from 'antd/es/input/Search';


function Companies() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation();

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
      title: t("Companies.COMPANY_NAME"),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t("Companies.CREATED_AT"),
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
      title: t("Companies.UPDATED_AT"),
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
      title: t("Companies.STATUS"),
      key: 'deleted',
      dataIndex: 'deleted',
      render: (deleted: boolean) => {
        const color = deleted ? 'red' : 'green';
        const text = deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE");
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: t("Companies.ACTIONS"),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>{t("Companies.EDIT")}</a>
          <a>{t("Companies.DELETE")}</a>
        </Space>
      ),
    },
  ];

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.COMPANIES);
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Şirketler yüklenirken hata oluştu:', error);
      message.error('Şirketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const searchCompaniesbyName = async (name: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.COMPANIES_SEARCH, {
        params: {
          name: name
        }
      });
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
      <Flex style={{ marginBottom: "20px" }}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={t("Companies.SEARCH")}
          size="large"
          onSearch={searchCompaniesbyName}
        />
      </Flex>
      <Table 
        columns={columns} 
        dataSource={companies} 
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
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} şirket`,
        }}
      />
    </Layout>
  )
}

export default Companies