import {
  Button,
  Empty,
  Flex,
  Layout,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import VehicleModal from "./components/VehicleModal";
import Search from "antd/es/input/Search";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useVehicles } from "../../hooks/useVehicles";
import type { VehiclesType, VehicleType } from "../../types";
import { formatLicencePlate } from "../../utils";

function Vehicles() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<VehicleType | undefined>(
    undefined
  );

  const { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle } =
    useVehicles();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const columns: ColumnsType<VehicleType> = [
    {
      title: t("Vehicles.LICENSE_PLATE"),
      dataIndex: "licence_plate",
      key: "licence_plate",
      render: formatLicencePlate,
    },
    {
      title: t("Vehicles.VEHICLE_TYPE"),
      dataIndex: "vehicle_type",
      key: "vehicle_type",
    },
    {
      title: t("Vehicles.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Vehicles.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Vehicles.STATUS"),
      key: "deleted",
      dataIndex: "deleted",
      render: (deleted: boolean) => (
        <Tag color={deleted ? "red" : "green"}>
          {deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE")}
        </Tag>
      ),
    },
    {
      title: t("Vehicles.ACTIONS"),
      key: "action",
      render: (_: any, record: VehicleType) => (
        <Space>
          <Button
            onClick={() => handleEdit(record)}
            color="yellow"
            variant="outlined"
          >
            {t("Companies.EDIT")}
          </Button>
          <Popconfirm
            title="Silme işlemi"
            description={
              <span>
                <strong>{formatLicencePlate(record.licence_plate)}</strong>{" "}
                plakalı aracı silmek istediğinize emin misiniz?
              </span>
            }
            okText="Onayla"
            cancelText="İptal"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record)}
          >
            <Button danger type="link">
              {t("Companies.DELETE")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = async (record: VehicleType) => {
    try {
      await deleteVehicle(record._id);
      messageApi.warning(
        <span>
          <strong>{record.licence_plate}</strong> plakalı araç başarıyla
          silindi.
        </span>
      );
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
    }
  };

  const handleFormSubmit = async (values: {
    inputLicencePlate: string;
    inputVehicleType: VehiclesType;
  }) => {
    try {
      if (selectedRecord) {
        await updateVehicle({
          id: selectedRecord._id,
          licence_plate: values.inputLicencePlate,
          vehicle_type: values.inputVehicleType,
        });
        messageApi.info(
          <span>
            <strong>{values.inputLicencePlate}</strong> plakalı araç başarıyla
            düzenlendi.
          </span>
        );
      } else {
        await createVehicle({
          licence_plate: values.inputLicencePlate,
          vehicle_type: values.inputVehicleType,
        });
        messageApi.success(
          <span>
            <strong>{values.inputLicencePlate}</strong> plakalı araç başarıyla
            eklendi.
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

  const handleEdit = (record: VehicleType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchText) return true;
    return vehicle.licence_plate
      .toLowerCase()
      .includes(searchText.toLowerCase());
  });

  return (
    <Layout style={{ padding: "0 50px" }}>
      {messageContextHolder}
      {notificationContextHolder}
      <Flex style={{ marginBottom: "20px" }} gap={25}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={
            <>
              <SearchOutlined /> {t("Companies.SEARCH")}
            </>
          }
          size="large"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> Araç Ekle
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={filteredVehicles}
        loading={isLoading}
        rowKey="_id"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("Table.NO_DATA")}
            />
          ),
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} araç`,
        }}
      />
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
      />
    </Layout>
  );
}

export default Vehicles;
