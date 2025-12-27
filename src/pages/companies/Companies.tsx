import { Button, Flex, Layout, message, notification } from "antd";
import Search from "antd/es/input/Search";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies";
import CompanyModal from "./components/CompanyModal";
import CompanyTable from "./components/CompanyTable";
import type { CompanyType } from "../../types";
import { useIsMobile } from "../../hooks/useIsMobile";
import CompanyCardList from "./components/CompanyCardList";

function Companies() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CompanyType | undefined>(
    undefined
  );

  const { companies, isLoading, createCompany, updateCompany, deleteCompany } =
    useCompanies();
  const isMobile = useIsMobile();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: CompanyType) => {
    try {
      await deleteCompany(record._id);
      messageApi.warning(
        <span>
          <strong>{record.name}</strong> firması başarıyla silindi.
        </span>
      );
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
    }
  };

  const handleFormSubmit = async (values: { inputName: string }) => {
    try {
      if (selectedRecord) {
        await updateCompany({ id: selectedRecord._id, name: values.inputName });
        messageApi.info(
          <span>
            <strong>{values.inputName}</strong> firması başarıyla düzenlendi.
          </span>
        );
      } else {
        await createCompany({ name: values.inputName });
        messageApi.success(
          <span>
            <strong>{values.inputName}</strong> firması başarıyla eklendi.
          </span>
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message?.toString() ||
        "Beklenmedik bir hata oluştu.";
      openErrorNotification(errorMsg);
    }
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: CompanyType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchText) return true;
    return company.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <Layout style={{ padding: isMobile ? "0 16px" : "0 50px" }}>
      {messageContextHolder}
      {notificationContextHolder}
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Companies.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> {isMobile ? "Ekle" : "Firma Ekle"}
        </Button>
      </Flex>
      {isMobile ? (
        <CompanyCardList
          companies={filteredCompanies}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <CompanyTable
          companies={filteredCompanies}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
      />
    </Layout>
  );
}

export default Companies;
