import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";
import { type CompanyType } from "../../../types";

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
        selectedRecord ? "Firma Düzenleme Formu" : "Yeni Firma Ekleme Formu"
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
          label="Firma İsmi"
          name="inputName"
          rules={[{ required: true, message: "Lütfen firma ismini giriniz!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {selectedRecord ? "Değişiklikleri Kaydet" : "Ekle"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyModal;
