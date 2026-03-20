import { useEffect, useState } from "react";
import { App } from "antd";
import { useNavigate } from "react-router";
import apiClient from "./apiClient";
import { ROUTES, STORAGE_KEYS } from "../constants";
import { CheckCircleOutlined, DisconnectOutlined } from "@ant-design/icons";

export const AxiosInterceptor = () => {
  const { message, notification } = App.useApp();
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

  useEffect(() => {
    // Response Interceptor
    const interceptor = apiClient.interceptors.response.use(
      (response) => {
        // Herhangi bir başarılı istek gelirse çevrimiçi olduğumuzu varsayabiliriz
        if (isOffline) {
          setIsOffline(false);
          setShowOnline(true);
          setTimeout(() => setShowOnline(false), 3000);
        }
        return response;
      },
      (error) => {
        // Global Hata Yönetimi
        if (error.response) {
          const { status } = error.response;

          if (status === 401) {
            message.warning("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            navigate(ROUTES.LOGIN);
          } else if (status === 403) {
            notification.error({
              message: "Yetkisiz Erişim",
              description: "Bu işlemi yapmaya yetkiniz bulunmamaktadır.",
            });
          } else if (status >= 500) {
            notification.error({
              message: "Sunucu Hatası",
              description:
                "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
            });
          }
        } else if (error.code === "ERR_NETWORK") {
          // Çok fazla mesaj çıkmaması için sadece state'i güncelliyoruz
          setIsOffline(true);
        }

        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [message, notification, navigate, isOffline]);

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
              İnternet bağlantınızı kontrol ediniz
            </>
          ) : (
            <>
              <CheckCircleOutlined />
              Bağlantı sağlandı
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AxiosInterceptor;
