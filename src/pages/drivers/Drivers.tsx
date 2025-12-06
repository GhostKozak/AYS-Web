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
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: DriverType) => {
    try {
      await deleteDriver(record._id);
      messageApi.warning(
        <span>
          <strong>{record.full_name}</strong> firması başarıyla silindi.
        </span>
      );
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
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
          <span>
            <strong>{values.inputName}</strong> güncellendi.
          </span>
        );
      } else {
        await createDriver(payload);
        messageApi.success(
          <span>
            <strong>{values.inputName}</strong> eklendi.
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
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> {isMobile ? "Ekle" : "Sürücü Ekle"}
        </Button>
      </Flex>
      {isMobile ? (
        <DriverCardList
          companies={filteredDrivers}
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
