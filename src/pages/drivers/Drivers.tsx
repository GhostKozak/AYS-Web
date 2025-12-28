import {
  Button,
  Empty,
  Flex,
  Layout,
  message,
  notification,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import Search from "antd/es/input/Search";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies"; // Şirketleri buradan çekiyoruz
import { useDrivers } from "../../hooks/useDrivers";
import DriverModal from "./components/DriverModal";

import { formatPhoneNumber } from "../../utils";

import type { ColumnsType } from "antd/es/table";
import type { DriverType } from "../../types";
import DriverTable from "./components/DriverTable";
import { useIsMobile } from "../../hooks/useIsMobile";
import DriverCardList from "./components/DriverCardList";

function Drivers() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DriverType | undefined>(
    undefined
  );

  const { drivers, isLoading, createDriver, updateDriver, deleteDriver } =
    useDrivers();
  const { companies } = useCompanies();
  const isMobile = useIsMobile();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: t("Errors.OPERATION_FAILED"),
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: DriverType) => {
    try {
      await deleteDriver(record._id);
      messageApi.success(
        <span>{t("Drivers.DELETE_SUCCESS", { name: record.full_name })}</span>
      );
    } catch (error) {
      messageApi.error(t("Errors.DELETE_FAILED"));
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
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: {
    inputName: string;
    inputPhone: string;
    inputCompany: string;
  }) => {
    try {
      const payload = {
        full_name: values.inputName,
        phone_number: values.inputPhone,
        company: values.inputCompany,
      };

      if (selectedRecord) {
        await updateDriver({ id: selectedRecord._id, ...payload });
        messageApi.info(
          <span>{t("Drivers.UPDATE_SUCCESS", { name: values.inputName })}</span>
        );
      } else {
        await createDriver(payload);
        messageApi.success(
          <span>{t("Drivers.CREATE_SUCCESS", { name: values.inputName })}</span>
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message?.toString() ||
        t("Errors.UNEXPECTED_ERROR");
      openErrorNotification(errorMsg);
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
      {messageContextHolder}
      {notificationContextHolder}
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
