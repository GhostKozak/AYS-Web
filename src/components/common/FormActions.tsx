import { Button, Flex, Form } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import GradientButton from "./GradientButton";

interface FormActionsProps {
  isEdit: boolean;
  isLoading: boolean;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  wrapperCol?: any;
}

export const FormActions = ({
  isEdit,
  isLoading,
  onCancel,
  submitText,
  cancelText,
  wrapperCol,
}: FormActionsProps) => {
  const { t } = useTranslation();

  return (
    <Form.Item label={null} wrapperCol={wrapperCol} style={{ marginTop: 20, marginBottom: 4 }}>
      <Flex gap={10} align="center">
        {/* ─── Submit Button ─── */}
        <GradientButton
          htmlType="submit"
          loading={isLoading}
          disabled={isLoading}
          color={isEdit ? "blue" : "cyan"}
          style={{ height: 40, paddingInline: 28, fontSize: 14 }}
        >
          {submitText ||
            (isLoading
              ? t("Common.SAVING", { defaultValue: "Kaydediliyor..." })
              : isEdit
              ? t("Common.SAVE")
              : t("Common.ADD"))}
        </GradientButton>

        {/* ─── Cancel Button ─── */}
        <Button
          onClick={onCancel}
          disabled={isLoading}
          icon={<CloseOutlined style={{ fontSize: 12 }} />}
          style={{
            height: 40,
            paddingInline: 20,
            fontWeight: 500,
            fontSize: 14,
            borderRadius: 10,
            transition: "all 0.25s ease",
          }}
        >
          {cancelText || t("Common.CANCEL", { defaultValue: "İptal" })}
        </Button>
      </Flex>
    </Form.Item>
  );
};

export default FormActions;
