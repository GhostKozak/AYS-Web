import { Table, Tag, Typography, Space, Input } from "antd";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../../api/auditApi";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import dayjs from "dayjs";
import { usePageTitle } from "../../hooks/usePageTitle";

import type { AuditType } from "../../types";

const { Title } = Typography;

function AuditPage() {
  const { t } = useTranslation();
  usePageTitle(t("Breadcrumbs.AUDIT"));
  
  const [searchParams, setSearchParams] = useSearchParams();
  
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
      render: (details: any) => (
        <pre style={{ fontSize: 10, maxWidth: 300, overflow: 'auto' }}>
          {JSON.stringify(details, null, 2)}
        </pre>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>{t("Audit.TITLE")}</Title>
      
      <Space style={{ marginBottom: 16 }} size="middle">
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
      />
    </div>
  );
}

export default AuditPage;
