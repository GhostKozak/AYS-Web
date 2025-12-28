import { Button, Result } from "antd";
import { useNavigate } from "react-router";
import { ROUTES } from "../../constants";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("Errors.PAGE_NOT_FOUND")}
      extra={
        <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
          {t("Common.BACK_HOME")}
        </Button>
      }
    />
  );
};

export default NotFoundPage;
