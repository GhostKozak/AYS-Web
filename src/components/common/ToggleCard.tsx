import React from "react";
import { Switch } from "antd";

interface ToggleCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  accentColor: string;
  /** Form.Item valuePropName="checked" tarafından inject edilir veya doğrudan geçilebilir */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Tıklanabilir toggle kart bileşeni.
 * Ant Design Form.Item içinde `valuePropName="checked"` ile kullanılabilir.
 *
 * @example
 * <Form.Item name="has_gps_tracking" valuePropName="checked">
 *   <ToggleCard icon="🛰️" title="GPS Takip" accentColor="#1677ff" />
 * </Form.Item>
 */
const ToggleCard: React.FC<ToggleCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  checked = false,
  onChange,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) onChange?.(!checked);
  };

  const handleSwitchChange = (val: boolean, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange?.(val);
  };

  return (
    <div
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 12,
        border: `1.5px solid ${checked ? accentColor : "var(--ant-color-border, #d9d9d9)"}`,
        background: checked
          ? `color-mix(in srgb, ${accentColor} 8%, var(--ant-color-bg-container, #fff))`
          : "var(--ant-color-bg-container, #fff)",
        padding: "12px 14px",
        transition: "all 0.22s ease",
        display: "flex",
        alignItems: "center",
        gap: 12,
        userSelect: "none",
        opacity: disabled ? 0.5 : 1,
        boxShadow: checked
          ? `0 0 0 3px color-mix(in srgb, ${accentColor} 15%, transparent)`
          : "none",
      }}
    >
      {/* İkon kutusu */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          background: checked
            ? `color-mix(in srgb, ${accentColor} 18%, var(--ant-color-bg-container, #fff))`
            : "var(--ant-color-fill-secondary, #f5f5f5)",
          transition: "background 0.22s ease",
        }}
      >
        {icon}
      </div>

      {/* Metin */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            lineHeight: "18px",
            color: checked ? accentColor : "var(--ant-color-text, #1f1f1f)",
            transition: "color 0.22s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 11,
              lineHeight: "15px",
              marginTop: 2,
              color: "var(--ant-color-text-tertiary, #8c8c8c)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* Switch */}
      <Switch
        size="small"
        checked={checked}
        disabled={disabled}
        onChange={handleSwitchChange as any}
        style={{
          flexShrink: 0,
          backgroundColor: checked ? accentColor : undefined,
        }}
      />
    </div>
  );
};

export default ToggleCard;
