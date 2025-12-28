import { App, Button, Flex, Layout } from "antd";
import Search from "antd/es/input/Search";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies";
import CompanyModal from "./components/CompanyModal";
import CompanyTable from "./components/CompanyTable";
import type { CompanyType } from "../../types";
import { useIsMobile } from "../../hooks/useIsMobile";
import CompanyCardList from "./components/CompanyCardList";

function Companies() {
  const { t } = useTranslation();
  const { message, notification, modal } = App.useApp();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CompanyType | undefined>(
    undefined
  );

  const { companies, isLoading, createCompany, updateCompany, deleteCompany } =
    useCompanies();
  const isMobile = useIsMobile();

  const handleDelete = async (record: CompanyType) => {
    try {
      await deleteCompany(record._id);
      notification.success({
        message: t("Companies.DELETE_SUCCESS", { name: record.name }),
      });
    } catch (error) {
      notification.error({ message: t("Errors.DELETE_FAILED") });
    }
  };

  const handleFormSubmit = async (values: { inputName: string }) => {
    try {
      if (selectedRecord) {
        await updateCompany({ id: selectedRecord._id, name: values.inputName });
        notification.info({
          message: (
            <span>
              {t("Companies.UPDATE_SUCCESS", { name: selectedRecord.name })}
            </span>
          ),
        });
      } else {
        await createCompany({ name: values.inputName });
        notification.success({
          message: (
            <span>
              {t("Companies.CREATE_SUCCESS", { name: values.inputName })}
            </span>
          ),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        notification.error({
          message:
            error.response?.data?.message || t("Errors.OPERATION_FAILED"),
        });
      }
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
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Common.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined />{" "}
          {isMobile ? t("Common.ADD") : t("Companies.ADD_BUTTON")}
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
