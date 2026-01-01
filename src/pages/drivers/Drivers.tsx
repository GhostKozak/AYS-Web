import { App, Button, Flex, Layout } from "antd";
import Search from "antd/es/input/Search";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies";
import { useDrivers } from "../../hooks/useDrivers";
import DriverModal from "./components/DriverModal";
import type { DriverType } from "../../types";
import DriverTable from "./components/DriverTable";
import { useIsMobile } from "../../hooks/useIsMobile";
import DriverCardList from "./components/DriverCardList";

function Drivers() {
  const { t } = useTranslation();
  const { message, notification, modal } = App.useApp();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DriverType | undefined>(
    undefined
  );

  const { drivers, isLoading, createDriver, updateDriver, deleteDriver } =
    useDrivers();
  const { companies } = useCompanies();
  const isMobile = useIsMobile();

  const handleDelete = async (record: DriverType) => {
    try {
      await deleteDriver(record._id);
      notification.success({
        message: (
          <span>{t("Drivers.DELETE_SUCCESS", { name: record.full_name })}</span>
        ),
      });
    } catch (error) {
      notification.error({ message: t("Errors.DELETE_FAILED") });
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: DriverType) => {
    setSelectedRecord(record);
    console.table(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: {
    full_name: string;
    phone_number: string;
    company: string;
  }) => {
    try {
      const payload = {
        full_name: values.full_name,
        phone_number: values.phone_number,
        company: values.company,
      };

      if (selectedRecord) {
        await updateDriver({ id: selectedRecord._id, ...payload });
        notification.info({
          message: (
            <span>
              {t("Drivers.UPDATE_SUCCESS", { name: values.full_name })}
            </span>
          ),
        });
      } else {
        await createDriver(payload);
        notification.success({
          message: (
            <span>
              {t("Drivers.CREATE_SUCCESS", { name: values.full_name })}
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

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchText) return true;
    return (
      driver.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.phone_number.includes(searchText)
    );
  });

  return (
    <Layout style={{ padding: isMobile ? "0 16px" : "0 50px" }}>
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t("Drivers.SEARCH")}
          allowClear
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Common.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined />{" "}
          {isMobile ? t("Common.ADD") : t("Drivers.ADD_BUTTON")}
        </Button>
      </Flex>
      {isMobile ? (
        <DriverCardList
          drivers={filteredDrivers}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <DriverTable
          drivers={filteredDrivers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
        companies={companies}
      />
    </Layout>
  );
}

export default Drivers;
