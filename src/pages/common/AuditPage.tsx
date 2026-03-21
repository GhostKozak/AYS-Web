import { useState } from "react";
import { Table, Tag, Typography, Space, Input, Button, Modal, Layout, Flex } from "antd";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../../api/auditApi";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import dayjs from "dayjs";
import { usePageTitle } from "../../hooks/usePageTitle";
import AuditDetailViewer from "./components/AuditDetailViewer";
import { useIsMobile } from "../../hooks/useIsMobile";

import type { AuditType } from "../../types";

const { Title } = Typography;

function AuditPage() {
  const { t } = useTranslation();
  usePageTitle(t("Breadcrumbs.AUDIT"));
  const isMobile = useIsMobile();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAudit, setSelectedAudit] = useState<AuditType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (record: AuditType) => {
    setSelectedAudit(record);
    setIsModalOpen(true);
  };

  const filters = {
    entity: searchParams.get("entity") || undefined,
    entityId: searchParams.get("entityId") || undefined,
  };

  const setFilters = (newFilters: { entity?: string; entityId?: string }) => {
    const next = new URLSearchParams(searchParams);
    if (newFilters.entity !== undefined) {
      if (newFilters.entity) next.set("entity", newFilters.entity);
      else next.delete("entity");
    }
    if (newFilters.entityId !== undefined) {
      if (newFilters.entityId) next.set("entityId", newFilters.entityId);
      else next.delete("entityId");
    }
    setSearchParams(next, { replace: true });
  };

  const { data, isLoading } = useQuery<AuditType[]>({
    queryKey: ["audit", filters],
    queryFn: () => auditApi.getAll(filters),
  });

  const columns = [
    {
      title: t("Audit.DATE"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY HH:mm:ss"),
    },
    {
      title: t("Audit.USER"),
      key: "user",
      render: (_: any, record: AuditType) => {
        const u = record.user;
        if (u && typeof u === 'object') {
          // Both camelCase and snake_case support for flexibility
          const first = u.firstName || (u as any).first_name || "";
          const last = u.lastName || (u as any).last_name || "";
          const full = (u as any).full_name || "";

          const displayName = `${first} ${last}`.trim() || full || u.email;
          if (displayName) return displayName;
        }
        return record.userEmail || "-";
      },
    },
    {
      title: t("Audit.ACTION"),
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        let color = "blue";
        if (action === "CREATE") color = "green";
        if (action === "DELETE") color = "red";
        if (action === "UPDATE") color = "orange";
        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: t("Audit.ENTITY"),
      dataIndex: "entity",
      key: "entity",
    },
    {
      title: t("Audit.ENTITY_ID"),
      dataIndex: "entityId",
      key: "entityId",
    },
    {
      title: t("Audit.DETAILS"),
      dataIndex: "details",
      key: "details",
      render: (_: any, record: AuditType) => (
        <Button size="small" type="dashed" onClick={() => handleViewDetails(record)}>
          {t("Audit.VIEW_DETAILS", "Detayları Gör")}
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: 0, marginBottom: 10 }}
      >
        <h1 style={{ margin: 0 }}>{t("Audit.TITLE")}</h1>
      </Flex>

      <Space style={{ marginBottom: 16 }} size="middle" wrap>
        <Input
          placeholder={t("Audit.ENTITY")}
          value={filters.entity}
          onChange={(e) => setFilters({ entity: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />
        <Input
          placeholder={t("Audit.ENTITY_ID")}
          value={filters.entityId}
          onChange={(e) => setFilters({ entityId: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={t("Audit.DETAILS")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            {t("Common.CLOSE")}
          </Button>
        ]}
        width={800}
      >
        {selectedAudit && (
          <AuditDetailViewer
            action={selectedAudit.action}
            details={selectedAudit.details}
            oldValue={selectedAudit.oldValue}
            newValue={selectedAudit.newValue}
          />
        )}
      </Modal>
    </Layout>
  );
}

export default AuditPage;
