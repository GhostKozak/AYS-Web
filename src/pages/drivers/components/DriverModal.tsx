import { Modal, Form, Input, Button, Select } from "antd";
import { useEffect } from "react";
import { type CompanyType, type DriverType } from "../../../types";
import { useTranslation } from "react-i18next";

interface DriverFormValues {
  inputName: string;
  inputPhone: string;
  inputCompany: string;
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

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        form.setFieldsValue({
          inputName: selectedRecord.full_name,
          inputPhone: selectedRecord.phone_number,
          inputCompany: selectedRecord.company?._id,
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
    >
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
          name="inputCompany"
          rules={[{ required: true, message: t("Drivers.COMPANY_REQUIRED") }]}
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
          name="inputName"
          rules={[{ required: true, message: t("Drivers.FULL_NAME_REQUIRED") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("Drivers.PHONE_NUMBER")}
          name="inputPhone"
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
    </Modal>
  );
};

export default DriverModal;
