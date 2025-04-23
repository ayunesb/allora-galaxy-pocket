
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useAgentFeedback } from "@/app/agents/hooks/useAgentFeedback";
import { format } from "date-fns";

export function AgentFeedbackTable() {
  const { feedback, isLoading } = useAgentFeedback();

  if (isLoading) {
    return <div>Loading feedback...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.from_agent}</TableCell>
              <TableCell>{f.to_agent}</TableCell>
              <TableCell>{f.rating}⭐</TableCell>
              <TableCell className="max-w-xs truncate">{f.feedback}</TableCell>
              <TableCell>{format(new Date(f.created_at), "MMM d, yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
