import { useEffect } from "react";
import { App } from "antd";
import { useNavigate } from "react-router";
import apiClient from "./apiClient";
import { ROUTES, STORAGE_KEYS } from "../constants";

export const AxiosInterceptor = () => {
  const { message, notification } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Request Interceptor (Aynen kalabilir veya buraya taşınabilir)

    // Response Interceptor
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        // Global Hata Yönetimi
        if (error.response) {
          const { status, data } = error.response;

          if (status === 401) {
            // Oturum süresi doldu mesajı
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
          message.error("İnternet bağlantınızı kontrol ediniz.");
        }

        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [message, notification, navigate]);

  return null;
};

export default AxiosInterceptor;
