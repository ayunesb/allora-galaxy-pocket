
import { StrategyErrorBoundary } from "@/app/strategy/components/StrategyErrorBoundary";
import { StrategyDetailContent } from "./components/StrategyDetailContent";

export default function StrategyDetail() {
  return (
    <StrategyErrorBoundary>
      <StrategyDetailContent />
    </StrategyErrorBoundary>
  );
}
