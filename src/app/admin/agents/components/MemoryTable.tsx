
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AgentMemory } from "@/types/agent";

interface MemoryTableProps {
  logs: AgentMemory[];
}

export default function MemoryTable({ logs }: MemoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Context</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.agent_name}</TableCell>
            <TableCell>{log.type}</TableCell>
            <TableCell className="max-w-md truncate">{log.context}</TableCell>
            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
