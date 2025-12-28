import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";
import { type CompanyType } from "../../../types";
import { useTranslation } from "react-i18next";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: { inputName: string }) => void;
  selectedRecord?: CompanyType;
  isLoading?: boolean;
}

const CompanyModal = ({
  isOpen,
  onClose,
  onFinish,
  selectedRecord,
  isLoading,
}: CompanyModalProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  // Modal açıldığında form dolsun veya temizlensin
  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        form.setFieldsValue({ inputName: selectedRecord.name });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, selectedRecord, form]);

  return (
    <Modal
      title={
        selectedRecord
          ? t("Companies.EDIT_FORM_TITLE")
          : t("Companies.ADD_FORM_TITLE")
      }
      closable={{ "aria-label": "Custom Close Button" }}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        name="companyForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, paddingBlock: 32 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label={t("Companies.COMPANY_NAME")}
          name="inputName"
          rules={[{ required: true, message: t("Companies.NAME_REQUIRED") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {selectedRecord ? t("Companies.SAVE_CHANGES") : t("Common.ADD")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyModal;
