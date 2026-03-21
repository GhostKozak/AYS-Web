import { useEffect, useState, useRef } from "react";
import { App } from "antd";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import apiClient from "./apiClient";
import { ROUTES } from "../constants";
import { CheckCircleOutlined, DisconnectOutlined } from "@ant-design/icons";
import { clearAuth } from "../utils/auth.utils";

export const AxiosInterceptor = () => {
  const { message, notification } = App.useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnline(true);
      const timer = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const tRef = useRef(t);
  const navigateRef = useRef(navigate);
  const isOfflineRef = useRef(isOffline);

  useEffect(() => {
    tRef.current = t;
    navigateRef.current = navigate;
    isOfflineRef.current = isOffline;
  }, [t, navigate, isOffline]);

  useEffect(() => {
    // Response Interceptor
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
              description:
                error.response?.data?.message || tRef.current("Errors.SERVER_ERROR_DESC"),
            });
          }
        } else if (error.code === "ERR_NETWORK") {
          setIsOffline(true);
        }

        // Güvenlik: Hassas verileri loglardan temizle
        const sanitizedError = {
          message: error.message,
          code: error.code,
          status: error.response?.status,
        };
        console.error("API Error:", sanitizedError);

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [message, notification]); // message and notification are stable from App.useApp()

  return (
    <>
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
