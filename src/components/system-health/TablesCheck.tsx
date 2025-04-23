
import React from "react";
import TablesStatusGrid from "./TablesStatusGrid";

interface TablesCheckProps {
  tables: Record<string, boolean>;
}

export const TablesCheck: React.FC<TablesCheckProps> = ({ tables }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">Database Tables</h3>
    <TablesStatusGrid tables={tables} />
  </div>
);
