import { Modal, Form, Input, Button, Select, Row, Col } from "antd";
import { useEffect, useMemo } from "react";
import { type CompanyType, type DriverType } from "../../../types";
import { useTranslation } from "react-i18next";
import { calculateDiffs } from "../../../utils";
import DiffViewer from "../../common/DiffViewer";

interface DriverFormValues {
  full_name: string;
  phone_number: string;
  company: string;
}

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: DriverFormValues) => void;
  selectedRecord?: DriverType;
  isLoading?: boolean;
  companies: CompanyType[];
}

const DriverModal = ({
  isOpen,
  onClose,
  onFinish,
  selectedRecord,
  isLoading,
  companies,
}: DriverModalProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const currentValues = Form.useWatch([], form);

  const diffs = useMemo(() => {
    return calculateDiffs(selectedRecord, currentValues, [
      {
        label: t("Drivers.COMPANY_NAME"),
        getOldValue: (r) => r.company?.name,
        getNewValue: (f) => companies.find((c) => c._id === f?.company)?.name,
      },
      {
        label: t("Drivers.FULL_NAME"),
        key: "full_name",
      },
      {
        label: t("Drivers.PHONE_NUMBER"),
        key: "phone_number",
      },
    ]);
  }, [selectedRecord, currentValues, companies, t]);

  const hasChanges = diffs.length > 0;

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        form.setFieldsValue({
          full_name: selectedRecord.full_name,
          phone_number: selectedRecord.phone_number,
          company: selectedRecord.company?._id,
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
          ? t("Drivers.EDIT_FORM_TITLE")
          : t("Drivers.ADD_FORM_TITLE")
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
            name="driverForm"
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600, paddingBlock: 32 }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label={t("Drivers.COMPANY_NAME")}
              name="company"
              rules={[
                { required: true, message: t("Drivers.COMPANY_REQUIRED") },
              ]}
            >
              <Select
                placeholder={t("Drivers.COMPANY_REQUIRED")}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {companies.map((company) => (
                  <Select.Option key={company._id} value={company._id}>
                    {company.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={t("Drivers.FULL_NAME")}
              name="full_name"
              rules={[
                { required: true, message: t("Drivers.FULL_NAME_REQUIRED") },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={t("Drivers.PHONE_NUMBER")}
              name="phone_number"
              rules={[{ required: true, message: t("Drivers.PHONE_REQUIRED") }]}
            >
              <Input />
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

export default DriverModal;
