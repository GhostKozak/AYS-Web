import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTrips } from "../../hooks/useTrips";
import { usePendingTrips } from "../../hooks/usePendingTrips";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Tag,
  Typography,
  App,
  Segmented,
  Empty,
  Modal,
  Input,
  Space,
} from "antd";
import {
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  StopOutlined,
  CameraOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { TripType } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { tripApi } from "../../api/tripApi";

const { Title, Text } = Typography;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function FieldDashboard() {
  const { t } = useTranslation();
  usePageTitle(t("FieldOps.TITLE"));
  const { trips, isLoading } = useTrips();
  const { pendingTrips, isLoading: isPendingLoading } = usePendingTrips();
  const [activeTab, setActiveTab] = useState<"URGENT" | "RAMP" | "PARK" | "PENDING">("URGENT");

  const prevUrgentCountRef = useRef(0);

  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sealNumber, setSealNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["trips"] });
    queryClient.invalidateQueries({ queryKey: ["pending-trips"] });
    message.success(t("FieldOps.REFRESH_SUCCESS"));
  };

  const openVerificationModal = (trip: TripType) => {
    setSelectedTrip(trip);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSealNumber("");
    setVerificationModalOpen(true);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      message.error(t("FieldOps.FILE_SIZE_ERROR"));
      e.target.value = "";
      return;
    }

    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }, [message, t]);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [photoPreview]);

  const handleVerifySubmit = async () => {
    if (!selectedTrip || !photoFile) {
      message.error(t("FieldOps.PHOTO_REQUIRED"));
      return;
    }

    setVerifying(true);
    try {
      await tripApi.fieldVerify(selectedTrip._id, photoFile, sealNumber || undefined);
      message.success(t("FieldOps.VERIFY_SUCCESS"));
      setVerificationModalOpen(false);
      clearPhoto();
      setSelectedTrip(null);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["pending-trips"] });
    } catch {
      message.error(t("Errors.OPERATION_FAILED"));
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const activeTrips = useMemo(() => {
    return trips.filter((trip) => !trip.is_trip_canceled);
  }, [trips]);

  const urgentTrips = useMemo(() => {
    return activeTrips.filter((trip) => trip.unload_status === "UNLOADED");
  }, [activeTrips]);

  const rampTrips = useMemo(() => {
    return activeTrips.filter(
      (trip) =>
        (trip.unload_status === "WAITING" || trip.unload_status === "IN_PROGRESS") &&
        trip.is_in_temporary_parking_lot === false,
    );
  }, [activeTrips]);

  const parkTrips = useMemo(() => {
    return activeTrips.filter(
      (trip) => trip.unload_status === "WAITING" && trip.is_in_temporary_parking_lot === true,
    );
  }, [activeTrips]);

  useEffect(() => {
    if (urgentTrips.length > prevUrgentCountRef.current) {
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play().catch((error) => {
        console.warn("Ses çalınamadı (Tarayıcı politikası):", error);
      });
      message.warning(t("FieldOps.URGENT_ACTION"));
    }
    prevUrgentCountRef.current = urgentTrips.length;
  }, [urgentTrips.length, t, message]);

  const VehicleCard = ({ trip, type }: { trip: TripType; type: "URGENT" | "RAMP" | "PARK" }) => {
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
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Row justify="space-between" align="middle">
          <Col span={16}>
            <Text style={{ fontSize: "1.5rem", fontWeight: "bold", display: "block" }}>
              {trip.vehicle?.licence_plate || "34 XXX 00"}
            </Text>
            <Text type="secondary" style={{ fontSize: "1rem" }}>
              <CarOutlined /> {trip.company?.name}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text strong>{t("FieldOps.DRIVER")}: </Text> {trip.driver?.full_name}
            </div>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            {type === "URGENT" && (
              <Tag color="success" style={{ fontSize: "14px", padding: "4px" }}>
                {t("Trips.STATUS_UNLOADED")}
              </Tag>
            )}
            {type === "RAMP" && (
              <Tag color="processing" style={{ fontSize: "14px", padding: "4px" }}>
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
          <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
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

  const PendingVehicleCard = ({ trip }: { trip: TripType }) => {
    return (
      <Card
        style={{
          marginBottom: 16,
          borderLeft: "6px solid #faad14",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Row justify="space-between" align="middle">
          <Col span={16}>
            <Text style={{ fontSize: "1.5rem", fontWeight: "bold", display: "block" }}>
              {trip.vehicle?.licence_plate || "34 XXX 00"}
            </Text>
            <Text type="secondary" style={{ fontSize: "1rem" }}>
              <CarOutlined /> {trip.company?.name}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text strong>{t("FieldOps.DRIVER")}: </Text> {trip.driver?.full_name}
            </div>
            {trip.arrival_time && (
              <div>
                <Text type="secondary">
                  {t("FieldOps.ARRIVAL")}:{" "}
                  {new Date(trip.arrival_time).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>
            )}
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Tag color="warning" style={{ fontSize: "14px", padding: "4px" }}>
              {t("Trips.STATUS_PENDING")}
            </Tag>
          </Col>
        </Row>

        <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
          <Button
            type="primary"
            icon={<CameraOutlined />}
            size="large"
            block
            onClick={() => openVerificationModal(trip)}
          >
            {t("FieldOps.DO_VERIFY")}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: "16px", maxWidth: "800px", margin: "0 auto", minHeight: "100vh" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {t("FieldOps.TITLE")}
          </Title>
          <Text type="secondary">
            {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
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
          {
            label: (
              <div style={{ padding: 4 }}>
                <div>{t("FieldOps.TAB_VERIFICATION")}</div>
                <Badge count={pendingTrips.length} showZero color="orange" />
              </div>
            ),
            value: "PENDING",
            icon: <UserOutlined />,
          },
        ]}
        value={activeTab}
        onChange={(val) => setActiveTab(val as "URGENT" | "RAMP" | "PARK" | "PENDING")}
        style={{ marginBottom: 20 }}
      />

      {isLoading || isPendingLoading ? (
        <div style={{ textAlign: "center", padding: 50 }}>{t("Common.LOADING")}...</div>
      ) : (
        <>
          {activeTab === "URGENT" && (
            <div>
              {urgentTrips.length === 0 ? (
                <Empty description={t("FieldOps.NO_VEHICLES")} />
              ) : (
                urgentTrips.map((trip) => <VehicleCard key={trip._id} trip={trip} type="URGENT" />)
              )}
            </div>
          )}

          {activeTab === "RAMP" && (
            <div>
              {rampTrips.length === 0 ? (
                <Empty description={t("FieldOps.NO_VEHICLES")} />
              ) : (
                rampTrips.map((trip) => <VehicleCard key={trip._id} trip={trip} type="RAMP" />)
              )}
            </div>
          )}

          {activeTab === "PARK" && (
            <div>
              {parkTrips.length === 0 ? (
                <Empty description={t("FieldOps.NO_VEHICLES")} />
              ) : (
                parkTrips.map((trip) => <VehicleCard key={trip._id} trip={trip} type="PARK" />)
              )}
            </div>
          )}

          {activeTab === "PENDING" && (
            <div>
              {pendingTrips.length === 0 ? (
                <Empty description={t("FieldOps.PENDING_EMPTY")} />
              ) : (
                pendingTrips.map((trip) => <PendingVehicleCard key={trip._id} trip={trip} />)
              )}
            </div>
          )}
        </>
      )}

      <Modal
        title={t("FieldOps.MODAL_TITLE")}
        open={verificationModalOpen}
        onCancel={() => {
          setVerificationModalOpen(false);
          clearPhoto();
          setSelectedTrip(null);
        }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setVerificationModalOpen(false);
                clearPhoto();
                setSelectedTrip(null);
              }}
            >
              {t("Common.CANCEL")}
            </Button>
            <Button
              type="primary"
              icon={<CameraOutlined />}
              loading={verifying}
              disabled={!photoFile}
              onClick={handleVerifySubmit}
            >
              {verifying ? t("FieldOps.VERIFYING") : t("FieldOps.VERIFY_SUBMIT")}
            </Button>
          </Space>
        }
      >
        {selectedTrip && (
          <div>
            <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
              <Row>
                <Col span={12}>
                  <Text strong>{t("Trips.LICENSE_PLATE")}:</Text>{" "}
                  {selectedTrip.vehicle?.licence_plate}
                </Col>
                <Col span={12}>
                  <Text strong>{t("FieldOps.DRIVER")}:</Text> {selectedTrip.driver?.full_name}
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text strong>{t("Trips.COMPANY_NAME")}:</Text> {selectedTrip.company?.name}
                </Col>
                {selectedTrip.arrival_time && (
                  <Col span={12}>
                    <Text strong>{t("FieldOps.ARRIVAL")}:</Text>{" "}
                    {new Date(selectedTrip.arrival_time).toLocaleString("tr-TR")}
                  </Col>
                )}
              </Row>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                {t("FieldOps.SEAL_NUMBER")}{" "}
                <Text type="secondary">{t("FieldOps.SEAL_OPTIONAL")}</Text>
              </Text>
              <Input
                placeholder={t("FieldOps.SEAL_PLACEHOLDER")}
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                maxLength={50}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                {t("FieldOps.PHOTO_UPLOAD")}
              </Text>
              <Text type="secondary" style={{ display: "block", marginBottom: 12, fontSize: 12 }}>
                {t("FieldOps.TAKE_PHOTO_SUB")}
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              {!photoPreview ? (
                <Button
                  icon={<CameraOutlined />}
                  size="large"
                  block
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("FieldOps.TAKE_PHOTO")}
                </Button>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  />
                  <br />
                  <Button danger icon={<DeleteOutlined />} onClick={clearPhoto}>
                    {t("Common.DELETE")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default FieldDashboard;
