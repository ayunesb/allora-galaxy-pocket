
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import StrategyWizard from "@/app/strategy-gen/StrategyWizard";
import { ToastProvider } from "@/components/ui/toast";

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

describe("Strategy Flow", () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  it("creates and launches a strategy", async () => {
    render(
      <TestWrapper>
        <StrategyWizard />
      </TestWrapper>
    );

    // Step 1: Select industry
    const industrySelect = screen.getByRole("combobox");
    fireEvent.change(industrySelect, { target: { value: "SaaS" } });
    
    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    // Step 2: Enter goal
    const goalInput = screen.getByPlaceholderText("e.g. Increase MRR, Lower CAC...");
    fireEvent.change(goalInput, { target: { value: "Boost retention" } });
    fireEvent.click(screen.getByText("Next →"));

    // Step 3: Verify strategy generation and launch
    await waitFor(() => {
      expect(screen.getByText("Generated Strategy")).toBeInTheDocument();
    });

    const launchButton = screen.getByText("Launch Strategy");
    fireEvent.click(launchButton);

    // Verify success toast appears
    await waitFor(() => {
      expect(screen.getByText("Strategy launched")).toBeInTheDocument();
    });
  });

  it("validates required fields before proceeding", async () => {
    render(
      <TestWrapper>
        <StrategyWizard />
      </TestWrapper>
    );

    // Try to proceed without selecting industry
    const nextButton = screen.getByText("Next →");
    expect(nextButton).toBeDisabled();

    // Select industry and verify button enables
    const industrySelect = screen.getByRole("combobox");
    fireEvent.change(industrySelect, { target: { value: "SaaS" } });
    expect(nextButton).not.toBeDisabled();
  });
});
