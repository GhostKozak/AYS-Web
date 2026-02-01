import { useMemo } from "react";
import { Card, List, Avatar, Tag, Typography, Space, theme } from "antd";
import { TruckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { TripType } from "../../../types";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { useToken } = theme;

const getStatusTag = (status: string, t: (key: string) => string) => {
  const normalizedStatus = status ? status.toUpperCase() : "UNKNOWN";
  const label = t(`Trips.STATUS_${normalizedStatus}`);

  switch (normalizedStatus) {
    case "WAITING":
      return (
        <Tag color="warning" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); // Sarı/Turuncu
    case "COMPLETED":
      return (
        <Tag color="success" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); // Yeşil
    case "UNLOADED":
      return (
        <Tag color="cyan" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); // Camgöbeği
    case "CANCELED":
      return (
        <Tag color="error" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); // Kırmızı
    default:
      return (
        <Tag color="default" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); // Gri
  }
};

const LiveOperationsList = ({ trips }: { trips: TripType[] }) => {
  // Ant Design theme tokens (for dark mode compatibility)
  const { token } = useToken();
  const { t } = useTranslation();

  // Veriyi sıralama ve son 6 taneyi alma mantığı (Aynı)
  const latestTrips = useMemo(() => {
    if (!trips) return [];
    return [...trips]
      .sort((a, b) => {
        const dateA = new Date(a.arrival_time || 0).getTime();
        const dateB = new Date(b.arrival_time || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [trips]);

  return (
    <Card
      // title={
      //   <Space>
      //     {/* Yanıp sönen yeşil nokta efekti için AntD Badge */}
      //     <Badge status="processing" color="green" />
      //     <Text strong style={{ fontSize: 16 }}>
      //       Son Hareketler
      //     </Text>
      //   </Space>
      // }
      variant="borderless"
      styles={{
        body: {
          maxHeight: "350px",
          overflow: "scroll",
          padding: "0 12px 12px 12px",
        },
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={latestTrips}
        locale={{ emptyText: t("Common.NO_DATA_YET") }}
        renderItem={(trip) => {
          const timeString = trip.arrival_time
            ? new Date(trip.arrival_time).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-";

          return (
            <List.Item
              style={{
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                padding: "12px 8px",
              }}
            >
              <List.Item.Meta
                // Kamyon İkonu (Avatar içinde)
                avatar={
                  <Avatar
                    shape="square"
                    icon={<TruckOutlined />}
                    style={{
                      backgroundColor: token.colorFillAlter,
                      color: token.colorPrimary,
                    }}
                  />
                }
                // Plaka Bilgisi (Başlık)
                title={
                  <Text strong style={{ fontSize: 14 }}>
                    {trip.vehicle?.licence_plate || t("Common.NO_PLATE")}
                  </Text>
                }
                // Firma Bilgisi (Alt Başlık)
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {trip.company?.name || t("Common.UNKNOWN_COMPANY")}
                  </Text>
                }
              />

              {/* Listenin Sağ Tarafı (Durum ve Saat) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                {getStatusTag(trip.unload_status, t)}

                <Space size={4}>
                  <ClockCircleOutlined
                    style={{ fontSize: 10, color: token.colorTextTertiary }}
                  />
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontFamily: "monospace" }}
                  >
                    {timeString}
                  </Text>
                </Space>
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default LiveOperationsList;
