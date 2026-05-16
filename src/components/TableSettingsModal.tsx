import { useEffect, useMemo, useState } from "react";
import { Modal, Checkbox, Radio, Space, Typography, Divider, Button } from "antd";
import { useTranslation } from "react-i18next";
import type { TableSettings } from "../types";

const { Text } = Typography;

type ColumnOption = {
  key: string;
  title: string;
  disabled?: boolean;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (settings: TableSettings) => void;
  onReset: () => void;
  settings: TableSettings;
  columns: ColumnOption[];
}

export default function TableSettingsModal({
  open,
  onClose,
  onSave,
  onReset,
  settings,
  columns,
}: Props) {
  const { t } = useTranslation();
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    settings.visibleColumns ?? columns.map((column) => column.key),
  );
  const [fontSize, setFontSize] = useState(settings.fontSize ?? "normal");

  useEffect(() => {
    setSelectedColumns(settings.visibleColumns ?? columns.map((column) => column.key));
    setFontSize(settings.fontSize ?? "normal");
  }, [settings, columns]);

  const checkboxOptions = useMemo(
    () =>
      columns.map((column) => ({
        label: column.title,
        value: column.key,
        disabled: column.disabled,
      })),
    [columns],
  );

  return (
    <Modal
      title={t("TableSettings.TITLE", "Table Settings")}
      open={open}
      onCancel={onClose}
      onOk={() => onSave({ visibleColumns: selectedColumns, fontSize })}
      okText={t("Common.SAVE", "Save")}
      cancelText={t("Common.CANCEL", "Cancel")}
      width={520}
      bodyStyle={{ paddingBottom: 16 }}
    >
      <Space
        orientation="horizontal"
        size="large"
        style={{ width: "100%", alignItems: "flex-start" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong>{t("TableSettings.SHOW_HIDE_COLUMNS", "Show / Hide Columns")}</Text>
          <Checkbox.Group
            options={checkboxOptions}
            value={selectedColumns}
            onChange={(values) => setSelectedColumns(values as string[])}
            style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}
          />
        </div>

        <Divider orientation="vertical" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text strong>{t("TableSettings.FONT_SIZE", "Font Size")}</Text>
          <Radio.Group
            value={fontSize}
            onChange={(event) => setFontSize(event.target.value)}
            style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Radio value="small">{t("TableSettings.FONT_SIZE_SMALL", "Small")}</Radio>
            <Radio value="normal">{t("TableSettings.FONT_SIZE_NORMAL", "Normal")}</Radio>
            <Radio value="large">{t("TableSettings.FONT_SIZE_LARGE", "Large")}</Radio>
          </Radio.Group>
        </div>
      </Space>

      <Button type="default" block onClick={onReset} style={{ marginTop : '1rem' }}> 
        {t("TableSettings.RESET_DEFAULTS", "Reset Defaults")}
      </Button>
    </Modal>
  );
}
