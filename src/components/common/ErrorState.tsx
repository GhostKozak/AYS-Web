import { Button, Result, Flex } from "antd";
import { useTranslation } from "react-i18next";

interface ErrorStateProps {
  title?: string;
  subTitle?: string;
  onRetry?: () => void;
}

function ErrorState({ title, subTitle, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <Flex justify="center" align="center" style={{ minHeight: 300 }}>
      <Result
        status="error"
        title={title || t("Errors.UNEXPECTED_ERROR")}
        subTitle={subTitle || t("Errors.GENERAL_ERROR")}
        extra={
          onRetry ? (
            <Button type="primary" onClick={onRetry}>
              {t("Common.RETRY", "Try Again")}
            </Button>
          ) : undefined
        }
      />
    </Flex>
  );
}

export default ErrorState;
