import { useEffect, useState, useRef, useCallback } from "react";
import { App } from "antd";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import apiClient from "./apiClient";
import { ROUTES } from "../constants";
import { CheckCircleOutlined, DisconnectOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { clearAuth } from "../utils/auth.utils";
import { addToQueue, getQueue, removeFromQueue, queueSize } from "../utils/offlineQueue";
import { getUser } from "../utils/auth.utils";
import { disconnectSocket } from "../utils/socket";
import { safeErrorMessage } from "../utils";

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

export const AxiosInterceptor = () => {
  const { message, notification } = App.useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnline, setShowOnline] = useState(false);
  const [pendingCount, setPendingCount] = useState(queueSize());

  const processQueue = useCallback(async () => {
    const items = getQueue();
    if (items.length === 0) return;

    const currentUser = getUser();
    const currentUserId = currentUser?._id;

    let success = 0;
    let failed = 0;

    for (const item of items) {
      // Belongs to a different user session — drop safely
      if (item.userId && item.userId !== currentUserId) {
        removeFromQueue(item.id);
        continue;
      }
      try {
        await apiClient({
          method: item.method,
          url: item.url,
          data: item.data,
        });
        removeFromQueue(item.id);
        success++;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        // 4xx client errors won't succeed on retry — drop them
        if (status && status >= 400 && status < 500) {
          removeFromQueue(item.id);
          failed++;
        }
        // 5xx / network errors stay in queue for next retry
      }
    }

    setPendingCount(queueSize());

    if (success > 0) {
      notification.success({
        key: "offline-queue-result",
        message: t("OfflineQueue.SYNCED_TITLE", "Requests Synced"),
        description: t("OfflineQueue.SYNCED_DESC", {
          defaultValue: "{{count}} request(s) completed successfully.",
          count: success,
        }),
      });
    }
    if (failed > 0) {
      notification.warning({
        key: "offline-queue-failed",
        message: t("OfflineQueue.FAILED_TITLE", "Sync Failed"),
        description: t("OfflineQueue.FAILED_DESC", {
          defaultValue: "{{count}} request(s) could not be processed.",
          count: failed,
        }),
      });
    }
  }, [notification, t]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnline(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setShowOnline(false);
        // Delay queue processing to let the "back online" toast settle
        processQueue();
      }, 1500);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [processQueue]);

  const tRef = useRef(t);
  const navigateRef = useRef(navigate);
  const isOfflineRef = useRef(isOffline);

  useEffect(() => {
    tRef.current = t;
    navigateRef.current = navigate;
    isOfflineRef.current = isOffline;
  }, [t, navigate, isOffline]);

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => {
        if (isOfflineRef.current) {
          setIsOffline(false);
          setShowOnline(true);
          setTimeout(() => setShowOnline(false), 3000);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          const { status } = error.response;

          if (status === 401) {
            message.warning(tRef.current("Errors.PLEASE_LOGIN_AGAIN"));
            clearAuth();
            disconnectSocket();
            navigateRef.current(ROUTES.LOGIN);
          } else if (status === 403) {
            notification.error({
              key: "403-forbidden",
              title: tRef.current("Common.ERROR"),
              description: tRef.current("Errors.UNAUTHORIZED_DESC"),
            });
          } else if (status >= 500) {
            notification.error({
              key: "500-server-error",
              title: tRef.current("Common.ERROR"),
              description: safeErrorMessage(error, tRef.current("Errors.SERVER_ERROR_DESC")),
            });
          }
        } else if (error.code === "ERR_NETWORK") {
          setIsOffline(true);

          // Only queue authenticated requests — reject unauthenticated mutations
          const currentUser = getUser();
          if (!currentUser?._id) return Promise.reject(error);

          // Queue mutating requests for replay when connection returns
          const method = error.config?.method?.toLowerCase();
          if (method && MUTATING_METHODS.has(method)) {
            const url = error.config?.url ?? "";
            const data = error.config?.data
              ? (() => {
                  try {
                    return JSON.parse(error.config.data);
                  } catch {
                    return error.config.data;
                  }
                })()
              : undefined;

            addToQueue(
              method.toUpperCase() as "POST" | "PUT" | "PATCH" | "DELETE",
              url,
              data,
              currentUser._id,
            );
            setPendingCount(queueSize());

            notification.info({
              key: "offline-queued",
              message: tRef.current("OfflineQueue.QUEUED_TITLE", "Request Queued"),
              description: tRef.current("OfflineQueue.QUEUED_DESC", {
                defaultValue: "Request will be replayed when connection is restored.",
              }),
              duration: 4,
            });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [message, notification]);

  return (
    <>
      {pendingCount > 0 && !isOffline && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            left: "20px",
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "#faad14",
            color: "#fff",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
          onClick={() => processQueue()}
        >
          <CloudUploadOutlined />
          {t("OfflineQueue.PENDING", {
            defaultValue: "{{count}} pending request(s)",
            count: pendingCount,
          })}
        </div>
      )}
      {(isOffline || showOnline) && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: isOffline ? "#ff4d4f" : "#52c41a",
            color: "white",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease-in-out",
          }}
        >
          {isOffline ? (
            <>
              <DisconnectOutlined />
              {t("Errors.NETWORK_ERROR_DESC")}
            </>
          ) : (
            <>
              <CheckCircleOutlined />
              {t("Errors.CONNECTION_RESTORED")}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AxiosInterceptor;
