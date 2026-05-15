import { Modal, Form, Input, Button, Select, Row, Col, Flex } from "antd";
import { useEffect, useMemo, useState } from "react";
import { type CompanyType, type DriverType } from "../../../types";
import { useTranslation } from "react-i18next";
import { calculateDiffs } from "../../../utils";
import DiffViewer from "../../common/DiffViewer";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../../../constants/countries";

interface DriverFormValues {
  full_name: string;
  phone_number: string;
  country_code: string;
  company: string;
}

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        getOldValue: (r) => r.phone_number,
        getNewValue: (f) => {
          if (!f.phone_number) return "";
          const country = COUNTRY_CODES.find((c) => c.code === f.country_code);
          const prefix = country?.value || DEFAULT_COUNTRY_CODE;
          return `${prefix}${f.phone_number}`;
        },
      },
    ]);
  }, [selectedRecord, currentValues, companies, t]);

  const hasChanges = diffs.length > 0;

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        // Find if the phone number starts with any of our country codes
        let prefix = DEFAULT_COUNTRY_CODE;
        let phone = selectedRecord.phone_number || "";

        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.value.length - a.value.length);
        for (const c of sortedCodes) {
          if (phone.startsWith(c.value)) {
            prefix = c.value;
            phone = phone.substring(c.value.length);
            break;
          }
        }

        // Handle legacy Turkish numbers starting with 05
        if (phone.startsWith("05") && phone.length === 11 && prefix === DEFAULT_COUNTRY_CODE) {
          phone = phone.substring(1); // Remove leading 0 if prefix is +90
        }

        form.setFieldsValue({
          full_name: selectedRecord.full_name,
          phone_number: phone,
          country_code: COUNTRY_CODES.find(c => c.value === prefix)?.code || "TR",
          company: selectedRecord.company?._id,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          country_code: "TR",
        });
      }
    }
  }, [isOpen, selectedRecord, form]);

  const prefixSelector = (
    <Form.Item name="country_code" noStyle>
      <Select
        style={{ width: 90 }}
        showSearch
        optionFilterProp="title"
        optionLabelProp="label"
        dropdownStyle={{ minWidth: 200 }}
      >
        {COUNTRY_CODES.map((c) => {
          const translatedName = t(`Countries.${c.name}`);
          return (
            <Select.Option
              key={c.code}
              value={c.code}
              label={c.value}
              title={`${translatedName} ${c.value} ${c.code}`}
            >
              <Flex justify="space-between" align="center">
                <Flex vertical>
                  <span style={{ fontWeight: 500 }}>{translatedName}</span>
                  <span style={{ fontSize: '0.8em', color: '#999' }}>{c.code}</span>
                </Flex>
                <span style={{ fontWeight: 600, color: '#1677ff' }}>{c.value}</span>
              </Flex>
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );

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
            onFinish={async (values: DriverFormValues) => {
              setIsSubmitting(true);
              try {
                const { country_code, phone_number, ...rest } = values;
                const country = COUNTRY_CODES.find(c => c.code === country_code);
                const prefix = country?.value || DEFAULT_COUNTRY_CODE;
                const full_phone = `${prefix}${phone_number}`;
                await onFinish({ ...rest, phone_number: full_phone });
              } finally {
                setIsSubmitting(false);
              }
            }}
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
                showSearch={{
                  filterOption: (input, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase()),
                }}
                options={companies.map(c => ({ label: c.name, value: c._id }))}
              />
            </Form.Item>

            <Form.Item
              label={t("Drivers.FULL_NAME")}
              name="full_name"
              rules={[
                { required: true, message: t("Drivers.FULL_NAME_REQUIRED") },
              ]}
            >
              <Input autoComplete="new-password" />
            </Form.Item>

            <Form.Item
              label={t("Drivers.PHONE_NUMBER")}
              name="phone_number"
              rules={[
                { required: true, message: t("Drivers.PHONE_REQUIRED") },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const countryCode = form.getFieldValue("country_code");
                    const country = COUNTRY_CODES.find(c => c.code === countryCode);
                    if (country?.value === "+90") {
                      if (/^5\d{9}$/.test(value)) return Promise.resolve();
                      return Promise.reject(t("Drivers.PHONE_FORMAT_ERROR", { defaultValue: "Geçerli bir numara giriniz (5XXXXXXXXX)" }));
                    }
                    if (/^\d{6,14}$/.test(value)) return Promise.resolve();
                    return Promise.reject(t("Drivers.PHONE_FORMAT_ERROR", { defaultValue: "Geçerli bir numara giriniz" }));
                  }
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                placeholder="5XX XXX XX XX"
                autoComplete="new-password"
                maxLength={15}
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

export default DriverModal;
