import { Modal, Form, Input, Button, Select } from "antd";
import { useEffect } from "react";
import { type CompanyType, type DriverType } from "../../../types";

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
        selectedRecord ? "Sürücü Düzenleme Formu" : "Yeni Sürücü Ekleme Formu"
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
          label="Firma"
          name="inputCompany"
          rules={[{ required: true, message: "Lütfen bir firma seçin!" }]}
        >
          <Select
            placeholder="Firma Seçin"
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
          label="Sürücü İsmi"
          name="inputName"
          rules={[{ required: true, message: "Lütfen sürücü ismini giriniz!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Telefon"
          name="inputPhone"
          rules={[
            { required: true, message: "Lütfen telefon numarasını giriniz!" },
          ]}
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

export default DriverModal;
