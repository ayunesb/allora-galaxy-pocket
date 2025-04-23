
import React from "react";
import { TablesCheck } from "./TablesCheck";

interface TableListSectionProps {
  tables: Record<string, boolean>;
}

const TableListSection: React.FC<TableListSectionProps> = ({ tables }) => (
  <div className="mb-6">
    <TablesCheck tables={tables} />
  </div>
);

export default TableListSection;
