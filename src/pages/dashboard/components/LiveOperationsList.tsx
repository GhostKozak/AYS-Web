import { useMemo } from "react";
import { Card, Flex, Avatar, Tag, Typography, Space, theme } from "antd";
import { TruckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useTrips } from "../../../hooks/useTrips";
import { formatLicencePlate } from "../../../utils";

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
      ); 
    case "COMPLETED":
      return (
        <Tag color="success" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); 
    case "UNLOADED":
      return (
        <Tag color="cyan" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); 
    case "CANCELED":
      return (
        <Tag color="error" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); 
    default:
      return (
        <Tag color="default" style={{ margin: 0 }}>
          {label}
        </Tag>
      ); 
  }
};

export default function LiveOperationsList() {
  const { trips, isLoading } = useTrips();
  const { token } = useToken();
  const { t } = useTranslation();

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
      variant="borderless"
      styles={{
        body: {
          maxHeight: "350px",
          overflow: "scroll",
          padding: "0 12px 12px 12px",
        },
      }}
    >
      <Flex vertical gap={0}>
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Text type="secondary">{t("Common.LOADING")}...</Text>
          </div>
        ) : latestTrips.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: token.colorTextTertiary }}>
            {t("Common.NO_DATA_YET")}
          </div>
        ) : (
          latestTrips.map((trip) => {
            const timeString = trip.arrival_time
              ? new Date(trip.arrival_time).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-";

            return (
              <Flex
                key={trip._id}
                justify="space-between"
                align="center"
                style={{
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  padding: "12px 8px",
                }}
              >
                <Flex gap="middle" align="center">
                  <Avatar
                    shape="square"
                    icon={<TruckOutlined />}
                    style={{
                      backgroundColor: token.colorFillAlter,
                      color: token.colorPrimary,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 14, color: token.colorText }}>
                      {trip.vehicle?.licence_plate 
                        ? formatLicencePlate(trip.vehicle.licence_plate) 
                        : t("Common.NO_PLATE")}
                    </div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      {trip.company?.name || t("Common.UNKNOWN_COMPANY")}
                    </div>
                  </div>
                </Flex>

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
              </Flex>
            );
          })
        )}
      </Flex>
    </Card>
  );
}
