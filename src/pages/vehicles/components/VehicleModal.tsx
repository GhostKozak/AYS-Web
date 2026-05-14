import { Modal, Form, Input, Button, Select, Row, Col } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Memoize options — avoid recreating the array on every render
  const vehicleOptions = useMemo(
    () =>
      VehicleValues.map((value) => ({
        label: t(`Vehicles.TYPE_${value}`),
        value,
      })),
    [t]
  );

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
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
            onFinish={async (values) => {
              setIsSubmitting(true);
              try {
                await onFinish({
                  ...values,
                  // Normalize plate: uppercase & trim whitespace
                  licence_plate: values.licence_plate.toUpperCase().trim(),
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            autoComplete="off"
          >
            <Form.Item
              label={t("Vehicles.LICENSE_PLATE")}
              name="licence_plate"
              rules={[
                { required: true, message: t("Vehicles.PLATE_REQUIRED") },
                {
                  min: 5,
                  message: t("Vehicles.PLATE_TOO_SHORT", { defaultValue: "Plaka en az 5 karakter olmalıdır" }),
                },
                {
                  max: 10,
                  message: t("Vehicles.PLATE_TOO_LONG", { defaultValue: "Plaka en fazla 10 karakter olabilir" }),
                },
              ]}
            >
              <Input
                autoComplete="new-password"
                placeholder="34 ABC 123"
                maxLength={10}
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>

            <Form.Item
              label={t("Vehicles.VEHICLE_TYPE")}
              name="vehicle_type"
              rules={[{ required: true, message: t("Vehicles.TYPE_REQUIRED") }]}
            >
              <Select
                placeholder={t("Vehicles.TYPE_REQUIRED")}
                showSearch={{
                  filterOption: (input, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase()),
                }}
                options={vehicleOptions}
              />
            </Form.Item>

            <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={isLoading || isSubmitting}>
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
