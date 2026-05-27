import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTrips } from "../../hooks/useTrips";
import { usePendingTrips } from "../../hooks/usePendingTrips";
import { useSocketSync } from "../../hooks/useSocketSync";
import { Badge, Button, Card, Col, Row, Tag, App, Modal, Input, Segmented, Image, notification } from "antd";
import type { InputRef } from "antd";
import {
  CarOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CameraOutlined, DeleteOutlined, UserOutlined,
  MoonOutlined, SunOutlined, SearchOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { TripType } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { tripApi } from "../../api/tripApi";
import ErrorState from "../../components/common/ErrorState";
import { formatDateTime, formatTime } from "../../utils";
import { useAppConfig } from "../../utils/AppConfigProvider";
import "./FieldDashboard.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function SyncAge({ lastSyncAt }: { lastSyncAt: number }) {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secs = Math.floor((now - lastSyncAt) / 1000);
  let label: string;
  if (secs < 3) label = t("FieldOps.JUST_NOW");
  else if (secs < 60) label = `${secs}sn`;
  else label = `${Math.floor(secs / 60)}dk`;
  return <>{t("FieldOps.LIVE")} · {label}</>;
}

function FieldDashboard() {
  const { t } = useTranslation();
  const { themeMode, toggleTheme } = useAppConfig();
  usePageTitle(t("FieldOps.TITLE"));
  const { trips, isLoading, isError: isTripsError, refetch: refetchTrips } = useTrips();
  const { pendingTrips, totalCount, hasMore, isLoading: isPendingLoading, isError: isPendingError, refetch: refetchPending } = usePendingTrips();
  const [activeTab, setActiveTab] = useState<"PENDING" | "PARK">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const prevUrgentCountRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchInputRef = useRef<InputRef>(null);

  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sealNumber, setSealNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastSyncAt, setLastSyncAt] = useState(Date.now());

  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const openPhotoPreview = useCallback((photoUrl: string) => {
    setPreviewImages([photoUrl]);
    setCurrentPreview(0);
    setPreviewVisible(true);
  }, []);

  useSocketSync(() => setLastSyncAt(Date.now()));

  useEffect(() => {
    if (hasMore) {
      notification.warning({
        message: t("FieldOps.LIMIT_WARNING_TITLE"),
        description: t("FieldOps.LIMIT_WARNING_DESC", { count: totalCount, limit: 200 }),
        duration: 8,
      });
    }
  }, [hasMore, totalCount, t]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const refreshQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["trips"] });
    queryClient.invalidateQueries({ queryKey: ["pending-trips"] });
  }, [queryClient]);

  const handleRefresh = () => {
    refreshQueries();
    setLastSyncAt(Date.now());
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
    setPhotoPreview(URL.createObjectURL(file));
  }, [message, t]);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [photoPreview]);

  const handleVerifySubmit = async () => {
    if (!selectedTrip) return;
    if (!sealNumber.trim()) {
      message.error(t("FieldOps.SEAL_REQUIRED"));
      return;
    }
    if (!photoFile) {
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("Errors.OPERATION_FAILED");
      message.error(typeof msg === "string" ? msg : t("Errors.OPERATION_FAILED"));
    } finally {
      setVerifying(false);
      refreshQueries();
    }
  };

  const handleReject = async (trip: TripType) => {
    try {
      await tripApi.update(trip._id, { is_trip_canceled: true });
      message.success(t("FieldOps.REJECT_SUCCESS"));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("Errors.OPERATION_FAILED");
      message.error(typeof msg === "string" ? msg : t("Errors.OPERATION_FAILED"));
    } finally {
      refreshQueries();
    }
  };


  const activeTrips = useMemo(() => trips.filter((t) => !t.is_trip_canceled), [trips]);

  const urgentTrips = useMemo(() => activeTrips.filter((t) => t.unload_status === "UNLOADED"), [activeTrips]);

  const parkTrips = useMemo(() =>
    activeTrips.filter((t) => t.unload_status === "WAITING"),
  [activeTrips]);

  const filteredPending = useMemo(() => {
    if (!debouncedSearch) return pendingTrips;
    const q = debouncedSearch.toLowerCase();
    return pendingTrips.filter((t) => t.vehicle?.licence_plate?.toLowerCase().includes(q));
  }, [pendingTrips, debouncedSearch]);

  const filteredPark = useMemo(() => {
    if (!debouncedSearch) return parkTrips;
    const q = debouncedSearch.toLowerCase();
    return parkTrips.filter((t) => t.vehicle?.licence_plate?.toLowerCase().includes(q));
  }, [parkTrips, debouncedSearch]);

  const newArrivals = useMemo(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    return filteredPending.filter((t) => new Date(t.arrival_time).getTime() > cutoff);
  }, [filteredPending]);

  const awaitingApproval = useMemo(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    return filteredPending.filter((t) => new Date(t.arrival_time).getTime() <= cutoff);
  }, [filteredPending]);

  useEffect(() => {
    if (urgentTrips.length > prevUrgentCountRef.current) {
      const audio = new Audio("/sounds/beep.ogg");
      audio.play().catch(() => {});
      message.warning(t("FieldOps.RAMP_ALERT"));
    }
    prevUrgentCountRef.current = urgentTrips.length;
  }, [urgentTrips.length, message, t]);

  function formatDuration(parkedAt: string): string {
    const diff = Date.now() - new Date(parkedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}s ${mins % 60}dk`;
  }

  if (isTripsError || isPendingError) {
    return (
      <div className="field-page">
        <div className="field-inner">
          <ErrorState onRetry={() => { refetchTrips(); refetchPending(); }} />
        </div>
      </div>
    );
  }

  const renderPendingCard = (trip: TripType) => {
    const waitingLong = Date.now() - new Date(trip.arrival_time).getTime() > 60 * 60 * 1000;
    const parked = trip.is_in_parking_lot || trip.is_in_temporary_parking_lot;
    return (
      <div key={trip._id} className="op-card">
        <div className="op-card-body">
          <div className="op-card-row" style={{ marginBottom: 6 }}>
            <div className="op-plate">{trip.vehicle?.licence_plate || "---"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {!!trip.has_gps_tracking && <Tag color="green" style={{ fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>🛰️ ATS</Tag>}
              {parked && (
                <Tag color={trip.is_in_temporary_parking_lot ? "orange" : "blue"} style={{ fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>
                  🅿️ {trip.is_in_temporary_parking_lot ? t("FieldOps.STATUS_KK") : t("FieldOps.STATUS_PARKED")}
                </Tag>
              )}
            </div>
          </div>
          <div className="op-card-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div className="op-meta" style={{ marginBottom: 4 }}>
                <CarOutlined /> {trip.company?.name || "-"}
              </div>
              <div className="op-meta">
                <ClockCircleOutlined style={{ fontSize: 12 }} />
                {trip.arrival_time ? formatTime(trip.arrival_time, { hour: "2-digit", minute: "2-digit" }) : "-"}
              </div>
              {trip.driver?.full_name && (
                <div className="op-meta"><UserOutlined style={{ fontSize: 12 }} /> {trip.driver.full_name}</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              {trip.field_photo_path && (
                <img
                  src={trip.field_photo_path}
                  alt=""
                  className="op-thumb"
                  onClick={() => openPhotoPreview(trip.field_photo_path!)}
                />
              )}
            </div>
          </div>
        </div>
        <div className="op-card-actions">
          <button className="op-btn op-btn-primary" onClick={() => openVerificationModal(trip)}>
            <CheckCircleOutlined /> {t("FieldOps.DO_VERIFY")}
          </button>
          {waitingLong && (
            <button className="op-btn op-btn-danger" onClick={() => handleReject(trip)}>
              <CloseCircleOutlined /> {t("FieldOps.REJECT")}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderParkCard = (trip: TripType) => {
    const parked = trip.is_in_temporary_parking_lot || trip.is_in_parking_lot;
    return (
      <div key={trip._id} className="op-card">
        <div className="op-card-body">
          <div className="op-card-row" style={{ marginBottom: 6 }}>
            <div className="op-plate">{trip.vehicle?.licence_plate || "---"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {!!trip.has_gps_tracking && <Tag color="green" style={{ fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>🛰️ ATS</Tag>}
              {parked && (
                <Tag color={trip.is_in_temporary_parking_lot ? "orange" : "blue"} style={{ fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>
                  🅿️ {trip.is_in_temporary_parking_lot ? t("FieldOps.STATUS_KK") : t("FieldOps.STATUS_PARKED")}
                </Tag>
              )}
            </div>
          </div>
          
          <div className="op-card-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div className="op-meta" style={{ marginBottom: 4 }}>
                <CarOutlined /> {trip.company?.name || "-"}
              </div>
              <div className="op-meta">
                <ClockCircleOutlined style={{ fontSize: 12 }} />
                {trip.arrival_time ? formatTime(trip.arrival_time, { hour: "2-digit", minute: "2-digit" }) : "-"}
                {parked && trip.parked_at && (
                  <Tag className="op-duration-tag" style={{ marginLeft: 6 }}>
                    {formatDuration(trip.parked_at)}
                  </Tag>
                )}
              </div>
              {trip.driver?.full_name && (
                <div className="op-meta"><UserOutlined style={{ fontSize: 12 }} /> {trip.driver.full_name}</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              {trip.field_photo_path && (
                <img
                  src={trip.field_photo_path}
                  alt=""
                  className="op-thumb"
                  onClick={() => openPhotoPreview(trip.field_photo_path!)}
                />
              )}
            </div>
          </div>
        </div>
        <div className="op-card-actions">
          <button className="op-btn op-btn-primary" onClick={() => openVerificationModal(trip)}>
            {t("FieldOps.UPDATE_SEAL_PHOTO")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="field-page" data-theme={themeMode}>
        {/* Sticky Header */}
        <div className="op-header">
          <div className="op-header-top">
            <div>
              <div className="op-title">{t("FieldOps.TITLE")}</div>
              <div className="op-live">
                <span className="op-live-dot" />
                <SyncAge lastSyncAt={lastSyncAt} />
              </div>
            </div>
            <div className="op-header-actions">
              <button className="op-icon-btn" onClick={toggleTheme} aria-label="Theme">
                {themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
              </button>
              <button className="op-icon-btn" onClick={handleRefresh} aria-label="Refresh">
                <ReloadOutlined />
              </button>
            </div>
          </div>

          <div className="op-search">
            <div className="op-search-wrap">
              <SearchOutlined className="op-search-icon" />
              <Input
                ref={searchInputRef}
                placeholder={t("FieldOps.SEARCH_PLATE")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="op-search-input"
              />
              {searchQuery && (
                <input className="op-search-clear" type="button" value="✕" onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }} />
              )}
            </div>
          </div>

          <div className="op-tabs">
            <Segmented
              block
              size="large"
              options={[
                { label: <span className="tab-label"><span className="tab-text">{t("FieldOps.TAB_PENDING")}</span><Badge count={pendingTrips.length} size="small" color="orange" /></span>, value: "PENDING" },
                { label: <span className="tab-label"><span className="tab-text">{t("FieldOps.TAB_WAITING")}</span><Badge count={parkTrips.length} size="small" color="default" /></span>, value: "PARK" },
              ]}
              value={activeTab}
              onChange={(val) => setActiveTab(val as "PENDING" | "PARK")}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading || isPendingLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)", fontSize: 14 }}>{t("FieldOps.LOADING")}</div>
        ) : (
          <>
            {activeTab === "PENDING" && (
              <div>
                {filteredPending.length === 0 ? (
                  <div className="op-empty">
                    <CheckCircleOutlined style={{ fontSize: 48, color: "var(--green)", marginBottom: 12 }} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("FieldOps.PENDING_EMPTY_TITLE")}</div>
                  </div>
                ) : (
                  <>
                    {newArrivals.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div className="op-section">{t("FieldOps.NEW_ARRIVALS", { count: newArrivals.length })}</div>
                        {newArrivals.map(renderPendingCard)}
                      </div>
                    )}
                    {awaitingApproval.length > 0 && (
                      <div>
                        <div className="op-section">{t("FieldOps.AWAITING_APPROVAL", { count: awaitingApproval.length })}</div>
                        {awaitingApproval.map(renderPendingCard)}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "PARK" && (
              <div>
                {filteredPark.length === 0 ? (
                  <div className="op-empty">
                    <CarOutlined style={{ fontSize: 48, color: "var(--text-secondary)", marginBottom: 12 }} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t("FieldOps.WAITING_EMPTY_TITLE")}</div>
                  </div>
                ) : (
                  filteredPark.map(renderParkCard)
                )}
              </div>
            )}
          </>
        )}

        {/* Verification Modal */}
        <Modal
          title={t("FieldOps.MODAL_TITLE")}
          open={verificationModalOpen}
          onCancel={() => { setVerificationModalOpen(false); clearPhoto(); setSelectedTrip(null); }}
          width={400}
          footer={
            <div style={{ display: "flex", gap: 8 }}>
              <Button block onClick={() => { setVerificationModalOpen(false); clearPhoto(); setSelectedTrip(null); }}>
                {t("Common.CANCEL")}
              </Button>
              <Button block type="primary" icon={<CameraOutlined />} loading={verifying} disabled={!photoFile || !sealNumber.trim()} onClick={handleVerifySubmit} size="large">
                {verifying ? t("FieldOps.VERIFYING") : t("FieldOps.SAVE_SEAL_PHOTO")}
              </Button>
            </div>
          }
        >
          {selectedTrip && (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Row>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("Trips.LICENSE_PLATE")}</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{selectedTrip.vehicle?.licence_plate}</div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("FieldOps.DRIVER")}</div>
                    <div style={{ color: "var(--text)" }}>{selectedTrip.driver?.full_name || "-"}</div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("Trips.COMPANY_NAME")}</div>
                    <div style={{ color: "var(--text)" }}>{selectedTrip.company?.name}</div>
                  </Col>
                  {selectedTrip.arrival_time && (
                    <Col span={12}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("FieldOps.ARRIVAL")}</div>
                      <div style={{ color: "var(--text)" }}>{formatDateTime(selectedTrip.arrival_time)}</div>
                    </Col>
                  )}
                </Row>
              </Card>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>
                  {t("FieldOps.SEAL_NUMBER")} <span style={{ color: "var(--red)" }}>*</span>
                </div>
                <Input placeholder={t("FieldOps.SEAL_PLACEHOLDER")} value={sealNumber} onChange={(e) => setSealNumber(e.target.value)} maxLength={50} size="large" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>
                  {t("FieldOps.PHOTO_UPLOAD")} <span style={{ color: "var(--red)" }}>*</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>{t("FieldOps.TAKE_PHOTO_SUB")}</div>
                <input ref={fileInputRef} type="file" accept="image/jpeg, image/png" capture="environment" onChange={handleFileSelect} style={{ display: "none" }} />
                {!photoPreview ? (
                  <Button icon={<CameraOutlined />} size="large" block onClick={() => fileInputRef.current?.click()} style={{ height: 52, borderRadius: 12 }}>
                    {t("FieldOps.TAKE_PHOTO")}
                  </Button>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <img src={photoPreview} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 12, marginBottom: 12, border: "2px solid var(--border)" }} />
                    <Button danger icon={<DeleteOutlined />} onClick={clearPhoto}>{t("Common.DELETE")}</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Image.PreviewGroup
          preview={{
            current: currentPreview,
            open: previewVisible,
            onOpenChange: (vis) => setPreviewVisible(vis),
          }}
        >
          {previewImages.map((src, idx) => (
            <Image key={idx} src={src} style={{ display: "none" }} />
          ))}
        </Image.PreviewGroup>
      </div>
  );
}

export default FieldDashboard;
