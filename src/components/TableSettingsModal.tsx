import { useEffect, useMemo, useState } from "react";
import { Modal, Checkbox, Radio, Space, Typography, Divider, Button, Input, Tag, message } from "antd";
import { useTranslation } from "react-i18next";
import type { TableSettings, TableFontSize } from "../types";
import { useAuth } from "../hooks/useAuth";
import { shortHash } from "../utils";

const { Text } = Typography;

const SANITIZE_NAME_RE = /[<>"']/g;
const VALID_FONT_SIZES: TableFontSize[] = ["small", "normal", "large"];



const isValidPresetItem = (v: unknown): v is { name: string; settings: TableSettings } => {
  if (typeof v !== "object" || v === null) return false;
  const item = v as Record<string, unknown>;
  if (typeof item.name !== "string" || item.name.trim().length === 0) return false;
  const s = item.settings as Record<string, unknown> | undefined;
  if (!s || typeof s !== "object") return false;
  if (s.visibleColumns !== undefined && (!Array.isArray(s.visibleColumns) || !s.visibleColumns.every((c) => typeof c === "string"))) return false;
  if (s.fontSize !== undefined && !VALID_FONT_SIZES.includes(s.fontSize as TableFontSize)) return false;
  return true;
};

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
  tableId: string;
}

interface PresetItem {
  name: string;
  settings: TableSettings;
}

export default function TableSettingsModal({
  open,
  onClose,
  onSave,
  onReset,
  settings,
  columns,
  tableId,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?._id ?? null;

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    settings.visibleColumns ?? columns.map((column) => column.key),
  );
  const [fontSize, setFontSize] = useState<TableFontSize>(settings.fontSize ?? "normal");

  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  const storageKey = useMemo(
    () => `tbl_prsts:${userId ? shortHash(userId) : "g"}:${tableId}`,
    [userId, tableId]
  );

  useEffect(() => {
    setSelectedColumns(settings.visibleColumns ?? columns.map((column) => column.key));
    setFontSize(settings.fontSize ?? "normal");
  }, [settings, columns]);

  // Load presets with schema validation
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const raw: unknown[] = JSON.parse(stored);
        if (Array.isArray(raw)) {
          setPresets(raw.filter(isValidPresetItem));
        } else {
          setPresets([]);
        }
      } else {
        setPresets([]);
      }
    } catch {
      setPresets([]);
    }
  }, [storageKey]);

  const savePreset = () => {
    const raw = newPresetName.trim().replace(SANITIZE_NAME_RE, "");
    if (!raw) {
      message.error(t("TableSettings.PRESET_NAME_EMPTY", "Preset name cannot be empty"));
      return;
    }
    if (raw.length > 30) {
      message.error(t("TableSettings.PRESET_NAME_TOO_LONG", "Preset name must be 30 characters or less"));
      return;
    }

    if (presets.some((p) => p.name.toLowerCase() === raw.toLowerCase())) {
      message.error(
        t("TableSettings.PRESET_ALREADY_EXISTS", "A preset with this name already exists")
      );
      return;
    }

    const newPreset: PresetItem = {
      name: raw,
      settings: {
        visibleColumns: selectedColumns,
        fontSize,
      },
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedPresets));
    } catch {
      // localStorage not available
    }
    setNewPresetName("");
    message.success(
      t("TableSettings.SAVE_PRESET_SUCCESS", {
        defaultValue: `Preset "${raw}" saved successfully`,
        name: raw,
      })
    );
  };

  const deletePreset = (nameToDelete: string) => {
    const updatedPresets = presets.filter((p) => p.name !== nameToDelete);
    setPresets(updatedPresets);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedPresets));
    } catch {
      // localStorage not available
    }
    message.success(
      t("TableSettings.DELETE_PRESET_SUCCESS", {
        defaultValue: `Preset "${nameToDelete}" deleted successfully`,
        name: nameToDelete,
      })
    );
  };

  const applyPreset = (preset: PresetItem) => {
    if (preset.settings.visibleColumns) {
      setSelectedColumns(preset.settings.visibleColumns);
    }
    if (preset.settings.fontSize) {
      setFontSize(preset.settings.fontSize);
    }
    message.success(
      t("TableSettings.APPLY_PRESET_SUCCESS", "Preset applied successfully")
    );
  };

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
      styles={{ body: { paddingBottom: 16 } }}
    >
      {/* Presets Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <Text strong style={{ fontSize: "1.05rem" }}>
          {t("TableSettings.PRESETS", "Saved Presets")}
        </Text>

        {presets.length === 0 ? (
          <Text type="secondary" style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
            {t("TableSettings.NO_PRESETS", "No custom presets saved yet.")}
          </Text>
        ) : (
          <Space size={[8, 8]} wrap style={{ width: "100%", minHeight: 32 }}>
            {presets.map((preset) => (
              <Tag
                key={preset.name}
                closable
                onClose={(e) => {
                  e.preventDefault();
                  deletePreset(preset.name);
                }}
                onClick={() => applyPreset(preset)}
                style={{
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 500,
                  border: "1px solid rgba(22, 119, 255, 0.2)",
                  backgroundColor: "rgba(22, 119, 255, 0.05)",
                  color: "#1677ff",
                  transition: "all 0.2s ease-in-out",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(22, 119, 255, 0.12)";
                  e.currentTarget.style.borderColor = "#1677ff";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(22, 119, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(22, 119, 255, 0.2)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                {preset.name}
              </Tag>
            ))}
          </Space>
        )}

        <div style={{ display: "flex", gap: 8, width: "100%", alignItems: "center", marginTop: 4 }}>
          <Input
            placeholder={t("TableSettings.PRESET_NAME_PLACEHOLDER", "Enter preset name...")}
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            onPressEnter={savePreset}
            maxLength={30}
            style={{ flex: 1 }}
          />
          <Button type="primary" onClick={savePreset}>
            {t("TableSettings.SAVE_PRESET", "Save")}
          </Button>
        </div>
      </div>

      <Divider style={{ margin: "16px 0" }} />

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

      <Button type="default" block onClick={onReset} style={{ marginTop: '1rem' }}>
        {t("TableSettings.RESET_DEFAULTS", "Reset Defaults")}
      </Button>
    </Modal>
  );
}
