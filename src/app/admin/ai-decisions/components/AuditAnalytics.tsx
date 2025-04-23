
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

type AuditDataRow = {
  version: number;
  success_rate: number;
  rollback_count: number;
  upvotes: number;
};

type AuditAnalyticsProps = {
  auditData: AuditDataRow[];
};

export function AuditAnalytics({ auditData }: AuditAnalyticsProps) {
  return (
    <div className="mb-10 bg-muted rounded-lg p-3">
      <h3 className="font-bold mb-1">Audit Analytics (by Version)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={auditData}>
          <XAxis dataKey="version" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="success_rate" stroke="#10b981" name="Success %" />
          <Line type="monotone" dataKey="upvotes" stroke="#3b82f6" name="Upvotes" />
          <Line type="monotone" dataKey="rollback_count" stroke="#ef4444" name="Rollbacks" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
