import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTrips } from "../../hooks/useTrips";
import { usePendingTrips } from "../../hooks/usePendingTrips";
import { useSocketSync } from "../../hooks/useSocketSync";
import { Badge, Button, Card, Col, Row, Tag, App, Modal, Input, Segmented } from "antd";
import type { InputRef } from "antd";
import {
  CarOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CameraOutlined, DeleteOutlined,
  MoonOutlined, SunOutlined, SearchOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { TripType } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { tripApi } from "../../api/tripApi";
import ErrorState from "../../components/common/ErrorState";
import { formatDateTime, formatTime } from "../../utils";
import { useAppConfig } from "../../utils/AppConfigProvider";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function FieldDashboard() {
  const { t } = useTranslation();
  const { themeMode, toggleTheme } = useAppConfig();
  usePageTitle(t("FieldOps.TITLE"));
  const { trips, isLoading, isError: isTripsError, refetch: refetchTrips } = useTrips();
  const { pendingTrips, isLoading: isPendingLoading, isError: isPendingError, refetch: refetchPending } = usePendingTrips();
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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useSocketSync(() => setLastSyncAt(Date.now()));

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
    const cutoff = now - 60 * 60 * 1000;
    return filteredPending.filter((t) => new Date(t.arrival_time).getTime() > cutoff);
  }, [filteredPending, now]);

  const awaitingApproval = useMemo(() => {
    const cutoff = now - 60 * 60 * 1000;
    return filteredPending.filter((t) => new Date(t.arrival_time).getTime() <= cutoff);
  }, [filteredPending, now]);

  useEffect(() => {
    if (urgentTrips.length > prevUrgentCountRef.current) {
      const audio = new Audio("/sounds/beep.ogg");
      audio.play().catch(() => {});
      message.warning(t("FieldOps.RAMP_ALERT"));
    }
    prevUrgentCountRef.current = urgentTrips.length;
  }, [urgentTrips.length, message, t]);

  function syncAge(): string {
    const secs = Math.floor((now - lastSyncAt) / 1000);
    if (secs < 3) return t("FieldOps.JUST_NOW");
    if (secs < 60) return `${secs}sn`;
    const mins = Math.floor(secs / 60);
    return `${mins}dk`;
  }

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
    return (
      <div key={trip._id} className="op-card">
        <div className="op-card-body">
          <div className="op-plate">{trip.vehicle?.licence_plate || "---"}</div>
          <div className="op-meta">
            <CarOutlined /> {trip.company?.name || "-"}
            {!!trip.has_gps_tracking && <Tag color="green" style={{ marginLeft: 8, fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>🛰️ ATS</Tag>}
          </div>
          <div className="op-card-row">
            <div>
              <div className="op-meta">
                <ClockCircleOutlined style={{ fontSize: 12 }} />
                {trip.arrival_time ? formatTime(trip.arrival_time, { hour: "2-digit", minute: "2-digit" }) : "-"}
              </div>
              {trip.driver?.full_name && (
                <div className="op-meta" style={{ marginTop: 2 }}>{trip.driver.full_name}</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              {(trip.is_in_parking_lot || trip.is_in_temporary_parking_lot) && (
                <Tag color={trip.is_in_temporary_parking_lot ? "orange" : "blue"} style={{ fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>
                  🅿️ {trip.is_in_temporary_parking_lot ? t("FieldOps.STATUS_KK") : t("FieldOps.STATUS_PARKED")}
                </Tag>
              )}
              {trip.field_photo_path && (
                <img
                  src={trip.field_photo_path}
                  alt=""
                  className="op-thumb"
                  onClick={() => {
                    if (trip.field_photo_path) {
                      Modal.info({
                        title: t("FieldOps.PHOTO_TITLE"),
                        content: <img src={trip.field_photo_path} alt="" style={{ width: "100%", borderRadius: 8 }} />,
                      });
                    }
                  }}
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
          <div className="op-plate">{trip.vehicle?.licence_plate || "---"}</div>
          <div className="op-meta">
            <CarOutlined /> {trip.company?.name || "-"}
            {!!trip.has_gps_tracking && <Tag color="green" style={{ marginLeft: 8, fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>🛰️ ATS</Tag>}
          </div>
          <div className="op-card-row">
            <div>
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
                <div className="op-meta" style={{ marginTop: 2 }}>{trip.driver.full_name}</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              {parked && (
                <Tag color={trip.is_in_temporary_parking_lot ? "orange" : "blue"} style={{ fontSize: 10, borderRadius: 6, lineHeight: "18px" }}>
                  🅿️ {trip.is_in_temporary_parking_lot ? t("FieldOps.STATUS_KK") : t("FieldOps.STATUS_PARKED")}
                </Tag>
              )}
              {trip.field_photo_path && (
                <img
                  src={trip.field_photo_path}
                  alt=""
                  className="op-thumb"
                  onClick={() => {
                    if (trip.field_photo_path) {
                      Modal.info({
                        title: t("FieldOps.PHOTO_TITLE"),
                        content: <img src={trip.field_photo_path} alt="" style={{ width: "100%", borderRadius: 8 }} />,
                      });
                    }
                  }}
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
    <>
      <style>{`
        :root {
          --bg: ${themeMode === "dark" ? "#0d1117" : "#f0f2f5"};
          --bg-card: ${themeMode === "dark" ? "#161b22" : "#ffffff"};
          --text: ${themeMode === "dark" ? "#e6edf3" : "#172b4d"};
          --text-secondary: ${themeMode === "dark" ? "#8b949e" : "#5e6c84"};
          --border: ${themeMode === "dark" ? "#30363d" : "#e0e4e8"};
          --green: #22c55e;
          --red: #ef4444;
          --amber: #f59e0b;
          --blue: "#1677ff";
        }
        body { background: var(--bg) !important; margin: 0; }
        .field-page { max-width: 600px; margin: 0 auto; min-height: 100vh; padding: 0 8px 80px; }
        .field-inner { padding: 16px; }

        /* Header */
        .op-header { position: sticky; top: 0; z-index: 100; background: var(--bg); padding: 8px 0; }
        .op-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .op-title { font-size: 22px; font-weight: 700; margin: 0; color: var(--text); }
        .op-live { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); }
        .op-live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse-dot 2s infinite; }
        .op-header-actions { display: flex; gap: 6px; }
        .op-icon-btn { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .op-icon-btn:active { transform: scale(0.95); }

        /* Search */
        .op-search { margin-bottom: 8px; }
        .op-search-wrap { position: relative; }
        .op-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 16px; pointer-events: none; }
        .op-search-input { width: 100%; height: 44px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); padding: 0 36px 0 38px; font-size: 15px; outline: none; box-sizing: border-box; }
        .op-search-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
        .op-search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; padding: 4px; }

        /* Tabs */
        .op-tabs { margin-bottom: 12px; }
        .op-tabs .ant-segmented { background: var(--bg-card); border-radius: 12px; overflow: hidden; }
        .op-tabs .ant-segmented-item { flex: 1 1 0 !important; min-width: 0 !important; border-radius: 10px !important; }
        .op-tabs .ant-segmented-item-selected { font-weight: 600 !important; }
        .tab-label { display: flex !important; align-items: center !important; justify-content: center !important; gap: 4px !important; overflow: hidden !important; }
        .tab-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; }
        @media (max-width: 380px) { .tab-text { font-size: 11px; } }

        /* Section headers */
        .op-section { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }

        /* Cards */
        .op-card { background: var(--bg-card); border-radius: 14px; margin-bottom: 10px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .op-card-body { padding: 14px; }
        .op-card-actions { display: flex; gap: 8px; padding: 0 14px 14px; }
        .op-card-footer { border-top: 1px solid var(--border); padding: 10px; text-align: center; }
        .op-card-row { display: flex; justify-content: space-between; align-items: center; }
        .op-card-header { display: flex; align-items: center; gap: 8px; }

        /* Typography */
        .op-plate { font-size: 26px; font-weight: 800; letter-spacing: 1.5px; line-height: 1.2; color: var(--text); font-family: "SF Mono", "Roboto Mono", "Fira Code", monospace; }
        .op-plate-sm { font-size: 22px; font-weight: 700; letter-spacing: 1px; color: var(--text); font-family: "SF Mono", "Roboto Mono", "Fira Code", monospace; }
        .op-meta { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

        /* Buttons */
        .op-btn { display: flex; align-items: center; justify-content: center; gap: 6px; height: 50px; border-radius: 12px; font-size: 15px; font-weight: 600; border: none; cursor: pointer; flex: 1; padding: 0 16px; transition: transform 0.1s; }
        .op-btn:active { transform: scale(0.97); }
        .op-btn-primary { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
        .op-btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
        .op-btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
        .op-btn-lg { height: 52px; border-radius: 14px; font-size: 17px; font-weight: 700; width: 100%; }

        /* Urgent card */
        .op-urgent-card { border-radius: 14px; margin-bottom: 10px; border: 2px solid var(--red); background: var(--bg-card); overflow: hidden; animation: urgent-flash 1.5s ease-in-out infinite; }
        .op-urgent-body { padding: 12px; display: flex; align-items: center; gap: 10px; }
        .op-urgent-icon { font-size: 28px; color: var(--red); flex-shrink: 0; }
        .op-urgent-info { flex: 1; min-width: 0; }
        .op-urgent-label { font-size: 12px; color: var(--red); font-weight: 600; margin-top: 2px; }
        .op-urgent-time { flex-shrink: 0; font-size: 11px; color: var(--text-secondary); }
        .op-urgent-action { padding: 0 12px 12px; }

        /* Progress */
        .op-progress-wrapper { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .op-progress-track { flex: 1; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
        .op-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #1677ff, var(--green)); }
        .op-progress-label { font-size: 11px; color: var(--text-secondary); flex-shrink: 0; }

        /* Park */
        .op-duration-tag { font-size: 12px !important; border-radius: 8px !important; flex-shrink: 0; }
        .op-thumb { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; border: 2px solid var(--border); cursor: pointer; flex-shrink: 0; }

        /* Text button */
        .op-text-btn { background: none; border: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; padding: 4px 12px; }
        .op-text-btn:hover { color: #1677ff; }

        /* Empty state */
        .op-empty { text-align: center; padding: 60px 16px; color: var(--text-secondary); }

        /* Animations */
        @keyframes urgent-flash {
          0%, 100% { border-color: var(--red); box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50% { border-color: #fca5a5; box-shadow: 0 0 0 8px rgba(239,68,68,0.08); }
        }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div className="field-page">
        {/* Sticky Header */}
        <div className="op-header">
          <div className="op-header-top">
            <div>
              <div className="op-title">{t("FieldOps.TITLE")}</div>
              <div className="op-live">
                <span className="op-live-dot" />
                {t("FieldOps.LIVE")} · {syncAge()}
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
              <input
                ref={searchInputRef as React.Ref<HTMLInputElement>}
                type="text"
                className="op-search-input"
                placeholder={t("FieldOps.SEARCH_PLATE")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="op-search-clear" onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }}>✕</button>
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
      </div>
    </>
  );
}

export default FieldDashboard;
