import { useEffect, useState, useRef } from "react";
import { useTrips } from "../../hooks/useTrips";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Tag,
  Typography,
  message,
  Segmented,
  Empty,
} from "antd";
import {
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { TripType } from "../../types";
import { useQueryClient } from "@tanstack/react-query";

const { Title, Text } = Typography;

function FieldDashboard() {
  const { t } = useTranslation();
  const { trips, isLoading } = useTrips();
  const [activeTab, setActiveTab] = useState<"URGENT" | "RAMP" | "PARK">(
    "URGENT",
  );

  // Önceki acil durum sayısını tutmak için ref kullanıyoruz
  const prevUrgentCountRef = useRef(0);

  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["trips"] });
    message.success(t("FieldOps.REFRESH_SUCCESS"));
  };

  // --- VERİ FİLTRELEME MANTIĞI ---

  const activeTrips = trips.filter((trip) => !trip.is_trip_canceled);

  // 1. ACİL (Boşalmış -> Parka Gidecek)
  const urgentTrips = activeTrips.filter(
    (trip) => trip.unload_status === "UNLOADED",
  );

  // 2. SAHADA / RAMPADA
  const rampTrips = activeTrips.filter(
    (trip) =>
      (trip.unload_status === "WAITING" ||
        trip.unload_status === "IN_PROGRESS") &&
      trip.is_in_temporary_parking_lot === false,
  );

  // 3. PARKTA
  const parkTrips = activeTrips.filter(
    (trip) =>
      trip.unload_status === "WAITING" &&
      trip.is_in_temporary_parking_lot === true,
  );

  // --- SESLİ BİLDİRİM EFEKTİ ---
  useEffect(() => {
    // Eğer mevcut acil sayısı, öncekinden fazlaysa (Yeni araç boşa çıktıysa)
    if (urgentTrips.length > prevUrgentCountRef.current) {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
      ); // Google'ın standart kısa beep sesi

      audio.play().catch((error) => {
        // Tarayıcılar bazen kullanıcı etkileşimi olmadan sesi engeller
        console.warn("Ses çalınamadı (Tarayıcı politikası):", error);
      });

      // Opsiyonel: Ekranda da uyarı göster
      message.warning(t("FieldOps.URGENT_ACTION"));
    }

    // Referansı güncelle
    prevUrgentCountRef.current = urgentTrips.length;
  }, [urgentTrips.length, t]); // urgentTrips.length değiştiğinde çalışır

  // KART BİLEŞENİ
  const VehicleCard = ({
    trip,
    type,
  }: {
    trip: TripType;
    type: "URGENT" | "RAMP" | "PARK";
  }) => {
    let borderColor = "#faad14";
    if (type === "URGENT") borderColor = "#52c41a";
    if (type === "RAMP") borderColor = "#1890ff";
    if (type === "PARK") borderColor = "#8c8c8c";

    return (
      <Card
        style={{
          marginBottom: 16,
          borderLeft: `6px solid ${borderColor}`,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "12px 16px" }}
      >
        <Row justify="space-between" align="middle">
          <Col span={16}>
            <Text
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "block",
              }}
            >
              {trip.vehicle?.licence_plate || "34 XXX 00"}
            </Text>
            <Text type="secondary" style={{ fontSize: "1rem" }}>
              <CarOutlined /> {trip.company?.name}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text strong>{t("FieldOps.DRIVER")}: </Text>{" "}
              {trip.driver?.full_name}
            </div>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            {type === "URGENT" && (
              <Tag color="success" style={{ fontSize: "14px", padding: "4px" }}>
                {t("Trips.STATUS_UNLOADED")}
              </Tag>
            )}
            {type === "RAMP" && (
              <Tag
                color="processing"
                style={{ fontSize: "14px", padding: "4px" }}
              >
                {t("FieldOps.TAG_RAMP")}
              </Tag>
            )}
            {type === "PARK" && (
              <Tag color="default" style={{ fontSize: "14px", padding: "4px" }}>
                {t("FieldOps.TAG_PARK")}
              </Tag>
            )}
          </Col>
        </Row>

        {type === "URGENT" && (
          <div
            style={{
              marginTop: 12,
              borderTop: "1px solid #eee",
              paddingTop: 12,
            }}
          >
            <Text type="danger" strong>
              ⚠️ {t("FieldOps.ACTION_MOVE_TO_PARK")}
            </Text>
          </div>
        )}

        {type === "RAMP" && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">{t("FieldOps.LABEL_RAMP")}</Text>
          </div>
        )}

        {type === "PARK" && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">{t("FieldOps.LABEL_PARK")}</Text>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      {/* BAŞLIK ALANI */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {t("FieldOps.TITLE")}
          </Title>
          <Text type="secondary">
            {new Date().toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            shape="circle"
            icon={<ReloadOutlined />}
            size="large"
            onClick={handleRefresh}
          />
        </Col>
      </Row>

      {/* 3'LÜ SEKMELER */}
      <Segmented
        block
        size="large"
        options={[
          {
            label: (
              <div style={{ padding: 4 }}>
                <div>{t("FieldOps.TAB_URGENT")}</div>
                <Badge count={urgentTrips.length} color="green" />
              </div>
            ),
            value: "URGENT",
            icon: <CheckCircleOutlined />,
          },
          {
            label: (
              <div style={{ padding: 4 }}>
                <div>{t("FieldOps.TAB_RAMP")}</div>
                <Badge count={rampTrips.length} color="blue" />
              </div>
            ),
            value: "RAMP",
            icon: <ThunderboltOutlined />,
          },
          {
            label: (
              <div style={{ padding: 4 }}>
                <div>{t("FieldOps.TAB_PARK")}</div>
                <Badge count={parkTrips.length} showZero color="gray" />
              </div>
            ),
            value: "PARK",
            icon: <StopOutlined />,
          },
        ]}
        value={activeTab}
        onChange={(val) => setActiveTab(val as any)}
        style={{ marginBottom: 20 }}
      />

      {/* LİSTELEME ALANI */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 50 }}>Yükleniyor...</div>
      ) : (
        <>
          {activeTab === "URGENT" && (
            <div>
              {urgentTrips.length === 0 ? (
                <Empty description={t("FieldOps.NO_VEHICLES")} />
              ) : (
                urgentTrips.map((trip) => (
                  <VehicleCard key={trip._id} trip={trip} type="URGENT" />
                ))
              )}
            </div>
          )}

          {activeTab === "RAMP" && (
            <div>
              {rampTrips.length === 0 ? (
                <Empty description={t("FieldOps.NO_VEHICLES")} />
              ) : (
                rampTrips.map((trip) => (
                  <VehicleCard key={trip._id} trip={trip} type="RAMP" />
                ))
              )}
            </div>
          )}

          {activeTab === "PARK" && (
            <div>
              {parkTrips.length === 0 ? (
                <Empty description={t("FieldOps.NO_VEHICLES")} />
              ) : (
                parkTrips.map((trip) => (
                  <VehicleCard key={trip._id} trip={trip} type="PARK" />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FieldDashboard;
