import { Typography } from "antd";
import { ArrowRightOutlined, HistoryOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { DiffChange } from "../../types";

const { Text } = Typography;

type Props = {
  diffs: DiffChange[];
};

export default function DiffViewer({ diffs }: Props) {
  const { t } = useTranslation();

  if (diffs.length === 0) return null;

  return (
    <div id="diffViewer" className="fadeIn">
      <div
        style={{
          marginBottom: 15,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <HistoryOutlined style={{ color: "#1890ff", fontSize: 18 }} />
        <Text strong style={{ fontSize: 16 }}>
          {t("Common.CHANGES")}
        </Text>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {diffs.map(({ key, oldValue, newValue }) => (
          <div
            key={key}
            style={{
              padding: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
              borderLeft: "4px solid #52c41a", // Yeşil şerit
            }}
          >
            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 4 }}
            >
              {key}
            </Text>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Text delete type="secondary" style={{ color: "#ff4d4f" }}>
                {oldValue ? (
                  String(oldValue)
                ) : (
                  <em style={{ opacity: 0.5 }}>(Boş)</em>
                )}
              </Text>

              <ArrowRightOutlined style={{ color: "#bfbfbf", fontSize: 10 }} />

              <Text strong style={{ color: "#52c41a" }}>
                {newValue ? (
                  String(newValue)
                ) : (
                  <em style={{ opacity: 0.5 }}>(Boş)</em>
                )}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
