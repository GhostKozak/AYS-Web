import React from "react";
import { Card, Button } from "antd";
import { CloseOutlined, DragOutlined } from "@ant-design/icons";

interface DashboardWidgetProps {
  title: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  style?: React.CSSProperties;
  className?: string;
  // react-grid-layout tarafından otomatik gelen props:
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
}

// forwardRef kullanmak zorundayız çünkü react-grid-layout DOM elemanına erişmek ister
export const DashboardWidget = React.forwardRef<
  HTMLDivElement,
  DashboardWidgetProps
>(
  (
    {
      title,
      children,
      onClose,
      style,
      className,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
      >
        <Card
          title={
            <div
              style={{ display: "flex", alignItems: "center", cursor: "move" }}
              className="drag-handle"
            >
              <DragOutlined style={{ marginRight: 8, color: "#999" }} />
              {title}
            </div>
          }
          extra={
            <Button
              type="text"
              icon={<CloseOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Tıklama drag işlemini tetiklemesin
                onClose();
              }}
            />
          }
          variant="borderless"
          styles={{
            body: {
              height: "100%",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "10px",
              overflow: "hidden",
            },
          }}
        >
          {children}
        </Card>
      </div>
    );
  },
);
