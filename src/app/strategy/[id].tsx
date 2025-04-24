
import { StrategyErrorBoundary } from "./components/StrategyErrorBoundary";
import { StrategyDetailContent } from "./components/StrategyDetailContent";

export default function StrategyDetail() {
  return (
    <StrategyErrorBoundary>
      <StrategyDetailContent />
    </StrategyErrorBoundary>
  );
}
