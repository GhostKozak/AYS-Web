import { Modal, Form, Input, Button, Row, Col } from "antd";
import { useEffect, useMemo, useState } from "react";
import { type CompanyType } from "../../../types";
import { useTranslation } from "react-i18next";
import DiffViewer from "../../common/DiffViewer";
import { calculateDiffs } from "../../../utils";
import FormActions from "../../../components/common/FormActions";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: { name: string }) => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentValues = Form.useWatch([], form);

  const diffs = useMemo(() => {
    return calculateDiffs(selectedRecord, currentValues, [
      {
        label: t("Companies.COMPANY_NAME"),
        key: "name",
      },
    ]);
  }, [selectedRecord, currentValues, t]);

  const hasChanges = diffs.length > 0;

  // Form değerlerini modal açıldığında doldur veya temizle
  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        form.setFieldsValue({ name: selectedRecord.name });
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
            name="companyForm"
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600, paddingBlock: 32 }}
            onFinish={async (values) => {
              setIsSubmitting(true);
              try {
                await onFinish(values);
              } finally {
                setIsSubmitting(false);
              }
            }}
            autoComplete="off"
          >
            <Form.Item
              label={t("Companies.COMPANY_NAME")}
              name="name"
              rules={[
                { required: true, message: t("Companies.NAME_REQUIRED") },
                { min: 2, message: t("Companies.NAME_TOO_SHORT", { defaultValue: "Company name must be at least 2 characters" }) },
                { max: 100, message: t("Companies.NAME_TOO_LONG", { defaultValue: "Company name must be at most 100 characters" }) },
              ]}
            >
              <Input
                autoComplete="new-password"
                placeholder={t("Companies.COMPANY_NAME")}
                maxLength={100}
                showCount
              />
            </Form.Item>

            <FormActions
              isEdit={!!selectedRecord}
              isLoading={isLoading || isSubmitting}
              onCancel={onClose}
              wrapperCol={{ offset: 8, span: 16 }}
            />
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

export default CompanyModal;
