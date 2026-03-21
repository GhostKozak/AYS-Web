import { Row, Col, Typography, Card, Switch, Space } from 'antd';
import { useState } from 'react';
import { JsonView, allExpanded, defaultStyles, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { useTranslation } from "react-i18next";
import { useAppConfig } from "../../../utils/AppConfigProvider";

const { Text } = Typography;

interface AuditDetailViewerProps {
  action: string;
  details?: any;
  oldValue?: any;
  newValue?: any;
}

function getDiff(oldObj: any, newObj: any): { oldDiff: any; newDiff: any; hasChanges: boolean } {
  if (oldObj === newObj) return { oldDiff: undefined, newDiff: undefined, hasChanges: false };
  
  if (typeof oldObj !== 'object' || oldObj === null || typeof newObj !== 'object' || newObj === null) {
     return { oldDiff: oldObj, newDiff: newObj, hasChanges: oldObj !== newObj };
  }

  if (Array.isArray(oldObj) || Array.isArray(newObj)) {
     const hasChanges = JSON.stringify(oldObj) !== JSON.stringify(newObj);
     return { 
       oldDiff: hasChanges ? oldObj : undefined, 
       newDiff: hasChanges ? newObj : undefined, 
       hasChanges 
     };
  }

  const oldDiff: any = {};
  const newDiff: any = {};
  let hasChanges = false;

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  allKeys.forEach((key: string) => {
    if (key === 'updatedAt' || key === 'createdAt') return; // ignore timestamp noise
    
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {
      const { oldDiff: subOld, newDiff: subNew, hasChanges: subHasChanges } = getDiff(oldVal, newVal);
      if (subHasChanges) {
        oldDiff[key] = subOld !== undefined ? subOld : oldVal;
        newDiff[key] = subNew !== undefined ? subNew : newVal;
        hasChanges = true;
      }
    } else if (oldVal !== newVal) {
      oldDiff[key] = oldVal;
      newDiff[key] = newVal;
      hasChanges = true;
    }
  });

  return { oldDiff, newDiff, hasChanges };
}

export default function AuditDetailViewer({ action, details, oldValue, newValue }: AuditDetailViewerProps) {
  const { t } = useTranslation();
  const { themeMode } = useAppConfig();
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);
  
  const jsonStyle = themeMode === 'dark' ? darkStyles : defaultStyles;
  
  let parsedDetails = details;
  if (typeof details === 'string') {
    try {
      if (details.trim() !== '') {
        parsedDetails = JSON.parse(details);
      }
    } catch (e) {
      // ignore
    }
  }

  // CREATE Action
  if (action === 'CREATE' && newValue !== undefined) {
    return (
      <Card size="small" title={<Text type="success">{t("Audit.AFTER", "Oluşturulan Kayıt")}</Text>} style={{ borderColor: '#b7eb8f', wordBreak: 'break-all' }}>
        <div style={{ overflowX: 'auto' }}>
          {typeof newValue === 'object' && newValue !== null ? (
            <JsonView data={newValue} shouldExpandNode={allExpanded} style={jsonStyle} />
          ) : (
            <pre>{String(newValue)}</pre>
          )}
        </div>
      </Card>
    );
  }

  // DELETE Action
  if (action === 'DELETE' && oldValue !== undefined) {
    return (
      <Card size="small" title={<Text type="danger">{t("Audit.BEFORE", "Silinen Kayıt")}</Text>} style={{ borderColor: '#ffa39e', wordBreak: 'break-all' }}>
        <div style={{ overflowX: 'auto' }}>
          {typeof oldValue === 'object' && oldValue !== null ? (
            <JsonView data={oldValue} shouldExpandNode={allExpanded} style={jsonStyle} />
          ) : (
            <pre>{String(oldValue)}</pre>
          )}
        </div>
      </Card>
    );
  }

  // UPDATE Action or fallback Diff
  const hasDirectDiff = oldValue !== undefined || newValue !== undefined;
  const hasBeforeAfter = !hasDirectDiff && typeof parsedDetails === 'object' && parsedDetails !== null && ('before' in parsedDetails || 'after' in parsedDetails);
  const hasOldNew = !hasDirectDiff && typeof parsedDetails === 'object' && parsedDetails !== null && ('old' in parsedDetails || 'new' in parsedDetails);
  
  if (hasDirectDiff || hasBeforeAfter || hasOldNew) {
    const beforeObj = hasDirectDiff ? oldValue : (hasBeforeAfter ? parsedDetails.before : parsedDetails.old);
    const afterObj = hasDirectDiff ? newValue : (hasBeforeAfter ? parsedDetails.after : parsedDetails.new);
    
    let displayBefore = beforeObj || {};
    let displayAfter = afterObj || {};
    
    if (showOnlyChanges) {
       const diffs = getDiff(beforeObj || {}, afterObj || {});
       displayBefore = diffs.oldDiff || {};
       displayAfter = diffs.newDiff || {};
    }
    
    return (
      <>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Space>
            <Text>{t("Audit.SHOW_ONLY_CHANGES", "Sadece Değişimleri Göster")}</Text>
            <Switch checked={showOnlyChanges} onChange={setShowOnlyChanges} />
          </Space>
        </div>
        <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title={<Text type="danger">{t("Audit.BEFORE", "Önceki")}</Text>} size="small" style={{ borderColor: '#ffa39e', wordBreak: 'break-all' }}>
            <div style={{ overflowX: 'auto' }}>
              {typeof displayBefore === 'object' && displayBefore !== null ? (
                <JsonView data={displayBefore} shouldExpandNode={allExpanded} style={jsonStyle} />
              ) : (
                <pre>{String(displayBefore || '-')}</pre>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<Text type="success">{t("Audit.AFTER", "Sonraki")}</Text>} size="small" style={{ borderColor: '#b7eb8f', wordBreak: 'break-all' }}>
            <div style={{ overflowX: 'auto' }}>
              {typeof displayAfter === 'object' && displayAfter !== null ? (
                <JsonView data={displayAfter} shouldExpandNode={allExpanded} style={jsonStyle} />
              ) : (
                <pre>{String(displayAfter || '-')}</pre>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      </>
    );
  }

  // Completely empty fallback
  if (parsedDetails === undefined && oldValue === undefined && newValue === undefined) {
    return <Text type="secondary">{t("Table.NO_DATA", "Veri bulunamadı")}</Text>;
  }

  // Normal JSON view for anything else
  return (
    <Card size="small" style={{ wordBreak: 'break-all' }}>
      <div style={{ overflowX: 'auto' }}>
        {typeof parsedDetails === 'object' && parsedDetails !== null ? (
          <JsonView data={parsedDetails} shouldExpandNode={allExpanded} style={jsonStyle} />
        ) : (
          <pre>{String(parsedDetails || '-')}</pre>
        )}
      </div>
    </Card>
  );
}
