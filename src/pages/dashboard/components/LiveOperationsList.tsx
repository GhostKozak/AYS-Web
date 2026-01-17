import { useMemo } from "react";
import { Card, List, Avatar, Tag, Typography, Badge, Space, theme } from "antd";
import { TruckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { TripType } from "../../../types";

const { Text } = Typography;
const { useToken } = theme;

// Durum Rengi Eşleştirmesi (Ant Design Preset Renkleri)
const getStatusTag = (status: string) => {
  const normalizedStatus = status ? status.toUpperCase() : "UNKNOWN";

  switch (normalizedStatus) {
    case "WAITING":
      return (
        <Tag color="warning" style={{ margin: 0 }}>
          Bekliyor
        </Tag>
      ); // Sarı/Turuncu
    case "COMPLETED":
      return (
        <Tag color="success" style={{ margin: 0 }}>
          Tamamlandı
        </Tag>
      ); // Yeşil
    case "UNLOADED":
      return (
        <Tag color="cyan" style={{ margin: 0 }}>
          Boşaltıldı
        </Tag>
      ); // Camgöbeği
    case "CANCELED":
      return (
        <Tag color="error" style={{ margin: 0 }}>
          İptal
        </Tag>
      ); // Kırmızı
    default:
      return (
        <Tag color="default" style={{ margin: 0 }}>
          Belirsiz
        </Tag>
      ); // Gri
  }
};

const LiveOperationsList = ({ trips }: { trips: TripType[] }) => {
  // Ant Design tema tokenlarını çekiyoruz (Dark mode renklerine uyum sağlaması için)
  const { token } = useToken();

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
      title={
        <Space>
          {/* Yanıp sönen yeşil nokta efekti için AntD Badge */}
          <Badge status="processing" color="green" />
          <Text strong style={{ fontSize: 16 }}>
            Son Hareketler
          </Text>
        </Space>
      }
      bordered={false}
      style={{
        height: "100%",
        marginBlock: 60,
        // Eğer kartın arka planını özel bir koyu renk yapmak istersen:
        // backgroundColor: '#1f2937'
      }}
      bodyStyle={{ padding: "0 12px 12px 12px" }} // Listeyi kenarlara biraz daha yaklaştırdık
    >
      <List
        itemLayout="horizontal"
        dataSource={latestTrips}
        locale={{ emptyText: "Henüz veri yok..." }}
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
                    {trip.vehicle?.licence_plate || "Plaka Yok"}
                  </Text>
                }
                // Firma Bilgisi (Alt Başlık)
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {trip.company?.name || "Bilinmeyen Firma"}
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
                {getStatusTag(trip.unload_status)}

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
