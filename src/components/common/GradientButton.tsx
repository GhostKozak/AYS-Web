import { Button } from "antd";
import type { ButtonProps } from "antd";

export interface GradientButtonProps extends Omit<ButtonProps, "color"> {
  color?: "cyan" | "blue" | "green" | "red" | "gray";
}

export const GradientButton = ({
  color = "cyan",
  style,
  children,
  ...props
}: GradientButtonProps) => {
  const getGradient = () => {
    switch (color) {
      case "blue":
        return {
          bg: "linear-gradient(135deg, #1677ff 0%, #0052cc 100%)",
          shadow: "0 4px 14px rgba(22, 119, 255, 0.35)",
          hoverShadow: "0 6px 20px rgba(22, 119, 255, 0.45)",
        };
      case "green":
        return {
          bg: "linear-gradient(135deg, #52c41a 0%, #2b8c00 100%)",
          shadow: "0 4px 14px rgba(82, 196, 26, 0.35)",
          hoverShadow: "0 6px 20px rgba(82, 196, 26, 0.45)",
        };
      case "red":
        return {
          bg: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
          shadow: "0 4px 14px rgba(255, 77, 79, 0.35)",
          hoverShadow: "0 6px 20px rgba(255, 77, 79, 0.45)",
        };
      case "gray":
        return {
          bg: "linear-gradient(135deg, #8c8c8c 0%, #595959 100%)",
          shadow: "0 4px 14px rgba(140, 140, 140, 0.35)",
          hoverShadow: "0 6px 20px rgba(140, 140, 140, 0.45)",
        };
      case "cyan":
      default:
        return {
          bg: "linear-gradient(135deg, #13c2c2 0%, #008080 100%)",
          shadow: "0 4px 14px rgba(19, 194, 194, 0.35)",
          hoverShadow: "0 6px 20px rgba(19, 194, 194, 0.45)",
        };
    }
  };

  const gradient = getGradient();

  return (
    <Button
      {...props}
      style={{
        height: props.size === "large" ? 40 : undefined,
        paddingInline: props.size === "large" ? 24 : undefined,
        fontWeight: 600,
        letterSpacing: "0.01em",
        border: "none",
        borderRadius: 10,
        background: props.disabled || props.loading ? undefined : gradient.bg,
        boxShadow: props.disabled || props.loading ? "none" : gradient.shadow,
        color: props.disabled || props.loading ? undefined : "#fff",
        transition: "all 0.25s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled && !props.loading) {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = gradient.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = props.disabled || props.loading ? "none" : gradient.shadow;
      }}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
