import { Modal, Form, Input, Button, Select } from "antd";
import { useEffect } from "react";
import {
  VehicleLabels,
  VehicleValues,
  type VehicleType,
  type VehicleTypeEnum,
} from "../../../types";
import { useTranslation } from "react-i18next";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: {
    inputLicencePlate: string;
    inputVehicleType: VehicleTypeEnum;
  }) => void;

  selectedRecord?: VehicleType;
  isLoading?: boolean;
}

const VehicleModal = ({
  isOpen,
  onClose,
  onFinish,
  selectedRecord,
  isLoading,
}: VehicleModalProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const vehicleOptions = VehicleValues.map((value) => ({
    label: VehicleLabels[value],
    value: value,
  }));

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        form.setFieldsValue({
          inputLicencePlate: selectedRecord.licence_plate,
          inputVehicleType: selectedRecord.vehicle_type,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, selectedRecord, form]);

  return (
    <Modal
      title={
        selectedRecord
          ? t("Vehicles.EDIT_FORM_TITLE")
          : t("Vehicles.ADD_FORM_TITLE")
      }
      closable={{ "aria-label": "Custom Close Button" }}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        name="vehicleForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, paddingBlock: 32 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label={t("Vehicles.LICENSE_PLATE")}
          name="inputLicencePlate"
          rules={[{ required: true, message: t("Vehicles.PLATE_REQUIRED") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("Vehicles.VEHICLE_TYPE")}
          name="inputVehicleType"
          rules={[{ required: true, message: t("Vehicles.TYPE_REQUIRED") }]}
        >
          <Select
            placeholder={t("Vehicles.TYPE_REQUIRED")}
            showSearch
            optionFilterProp="children"
            options={vehicleOptions}
          ></Select>
        </Form.Item>

        <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {selectedRecord ? t("Common.SAVE") : t("Common.ADD")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleModal;
