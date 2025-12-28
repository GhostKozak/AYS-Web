import { Button, Result } from "antd";
import { useNavigate, useRouteError } from "react-router";
import { ROUTES } from "../../constants";
import { useTranslation } from "react-i18next";

const ErrorPage = () => {
  const navigate = useNavigate();
  const error: any = useRouteError();
  const { t } = useTranslation();

  console.error(error);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Result
        status="500"
        title={t("Errors.UNEXPECTED_ERROR")}
        subTitle={
          error?.statusText || error?.message || t("Errors.GENERAL_ERROR")
        }
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
            {t("Common.BACK_HOME")}
          </Button>
        }
      />
    </div>
  );
};

export default ErrorPage;
