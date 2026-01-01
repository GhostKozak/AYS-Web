import { Modal, Form, Input, Button, Select, Row, Col } from "antd";
import { useEffect, useMemo } from "react";
import {
  VehicleLabels,
  VehicleValues,
  type VehicleType,
  type VehicleTypeEnum,
} from "../../../types";
import { useTranslation } from "react-i18next";
import DiffViewer from "../../common/DiffViewer";
import { calculateDiffs } from "../../../utils";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: {
    licence_plate: string;
    vehicle_type: VehicleTypeEnum;
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

  const currentValues = Form.useWatch([], form);

  const diffs = useMemo(() => {
    return calculateDiffs(selectedRecord, currentValues, [
      {
        label: t("Vehicles.LICENSE_PLATE"),
        key: "licence_plate",
      },
      {
        label: t("Vehicles.VEHICLE_TYPE"),
        key: "vehicle_type",
        getOldValue: (r) => t(`Vehicles.TYPE_${r.vehicle_type}`),
        getNewValue: (f) =>
          f.vehicle_type ? t(`Vehicles.TYPE_${f.vehicle_type}`) : undefined,
      },
    ]);
  }, [selectedRecord, currentValues, t]);

  const hasChanges = diffs.length > 0;

  const vehicleOptions = VehicleValues.map((value) => ({
    label: VehicleLabels[value],
    value: value,
  }));

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        console.table(selectedRecord);
        form.setFieldsValue({
          licence_plate: selectedRecord.licence_plate,
          vehicle_type: selectedRecord.vehicle_type,
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
      destroyOnHidden
      width={hasChanges ? 900 : 500}
      styles={{ body: { transition: "all 0.3s ease" } }}
    >
      <Row gutter={24}>
        <Col span={hasChanges ? 12 : 24}>
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
              name="licence_plate"
              rules={[
                { required: true, message: t("Vehicles.PLATE_REQUIRED") },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={t("Vehicles.VEHICLE_TYPE")}
              name="vehicle_type"
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
        </Col>
        {hasChanges && (
          <Col span={12} className="fadeIn">
            <DiffViewer diffs={diffs} />
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default VehicleModal;
