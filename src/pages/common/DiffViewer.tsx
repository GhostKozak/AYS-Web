import { Badge, Tag, Tooltip, Typography } from "antd";
import { ArrowRightOutlined, EditOutlined } from "@ant-design/icons";
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

      {/* ─── Başlık ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #1677ff22, #1677ff44)",
            border: "1px solid #1677ff55",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EditOutlined style={{ color: "#1677ff", fontSize: 15 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text strong style={{ fontSize: 14 }}>
            {t("Common.CHANGES")}
          </Text>
          <Badge
            count={diffs.length}
            style={{
              backgroundColor: "#1677ff",
              fontSize: 11,
              fontWeight: 600,
              boxShadow: "none",
            }}
          />
        </div>
      </div>

      {/* ─── Değişiklik Kartları ─── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxHeight: "calc(100vh - 260px)",
          overflowY: "auto",
          paddingRight: 2,
        }}
      >
        {diffs.map(({ key, oldValue, newValue }) => (
          <div
            key={key}
            style={{
              borderRadius: 10,
              border: "1px solid var(--ant-color-border, #e8e8e8)",
              overflow: "hidden",
              transition: "box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            {/* Alan adı — üst bant */}
            <div
              style={{
                padding: "6px 12px",
                background: "var(--ant-color-fill-quaternary, #f5f5f5)",
                borderBottom: "1px solid var(--ant-color-border, #e8e8e8)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#1677ff",
                  flexShrink: 0,
                }}
              />
              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}
              >
                {key}
              </Text>
            </div>

            {/* Eski → Yeni değer */}
            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {/* Eski değer */}
              <Tooltip title={t("Common.OLD_VALUE", { defaultValue: "Eski değer" })} placement="top">
                <Tag
                  style={{
                    margin: 0,
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    borderRadius: 6,
                    fontSize: 12,
                    padding: "2px 8px",
                    background: "#fff1f0",
                    border: "1px solid #ffccc7",
                    color: "#cf1322",
                    textDecoration: "line-through",
                    textDecorationColor: "#cf132266",
                    cursor: "default",
                  }}
                  title={String(oldValue || "")}
                >
                  {oldValue
                    ? String(oldValue)
                    : <em style={{ opacity: 0.5, fontStyle: "italic" }}>{t("Common.EMPTY", "(Boş)")}</em>
                  }
                </Tag>
              </Tooltip>

              {/* Ok */}
              <ArrowRightOutlined
                style={{
                  color: "var(--ant-color-text-quaternary, #bfbfbf)",
                  fontSize: 11,
                  flexShrink: 0,
                }}
              />

              {/* Yeni değer */}
              <Tooltip title={t("Common.NEW_VALUE", { defaultValue: "Yeni değer" })} placement="top">
                <Tag
                  style={{
                    margin: 0,
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    borderRadius: 6,
                    fontSize: 12,
                    padding: "2px 8px",
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    color: "#389e0d",
                    fontWeight: 600,
                    cursor: "default",
                  }}
                  title={String(newValue || "")}
                >
                  {newValue
                    ? String(newValue)
                    : <em style={{ opacity: 0.5, fontStyle: "italic", fontWeight: 400 }}>{t("Common.EMPTY", "(Boş)")}</em>
                  }
                </Tag>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
