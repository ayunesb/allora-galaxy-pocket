
import { render, screen } from "@testing-library/react";
import { PolicyRow } from "./PolicyRow";
import type { RlsPolicy } from "../../hooks/useRlsData";
import type { AccessTestResult } from "../../hooks/useAccessTests";

describe("PolicyRow", () => {
  const mockPolicy: RlsPolicy = {
    policyname: "test_policy",
    tablename: "test_table",
    schemaname: "public",
    command: "SELECT",
    definition: "auth.uid() = user_id AND tenant_id = auth.tenant_id()",
    permissive: "PERMISSIVE",
    roles: ["authenticated"]
  };

  const mockTestResult: AccessTestResult = {
    tableName: "test_table",
    status: "allowed",
    rowCount: 5
  };

  it("renders policy details correctly", () => {
    render(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={true}
            totalPolicies={1}
            testResult={mockTestResult}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("test_policy")).toBeInTheDocument();
    expect(screen.getByText("SELECT")).toBeInTheDocument();
    expect(screen.getByText("Secured")).toBeInTheDocument();
  });

  it("shows insecure badge when policy lacks auth reference", () => {
    const insecurePolicy: RlsPolicy = {
      ...mockPolicy,
      definition: "true"
    };

    render(
      <table>
        <tbody>
          <PolicyRow
            policy={insecurePolicy}
            tableName="test_table"
            isFirstPolicy={true}
            totalPolicies={1}
            testResult={mockTestResult}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Insecure")).toBeInTheDocument();
  });

  it("renders table name only for first policy in group", () => {
    const { rerender } = render(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={true}
            totalPolicies={2}
            testResult={mockTestResult}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("test_table")).toBeInTheDocument();

    rerender(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={false}
            totalPolicies={2}
            testResult={mockTestResult}
          />
        </tbody>
      </table>
    );

    expect(screen.queryByText("test_table")).not.toBeInTheDocument();
  });

  it("renders access test result only for first policy", () => {
    const { rerender } = render(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={true}
            totalPolicies={2}
            testResult={mockTestResult}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/Allowed/)).toBeInTheDocument();

    rerender(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={false}
            totalPolicies={2}
            testResult={mockTestResult}
          />
        </tbody>
      </table>
    );

    // Use querySelector to check if the text is actually not present
    const allowedText = document.querySelector('td:last-child');
    expect(allowedText).toBeNull();
  });

  it("handles blocked test result", () => {
    const blockedResult: AccessTestResult = {
      tableName: "test_table",
      status: "blocked"
    };

    render(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={true}
            totalPolicies={1}
            testResult={blockedResult}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  it("handles error test result", () => {
    const errorResult: AccessTestResult = {
      tableName: "test_table",
      status: "error",
      errorMessage: "Test error message"
    };

    render(
      <table>
        <tbody>
          <PolicyRow
            policy={mockPolicy}
            tableName="test_table"
            isFirstPolicy={true}
            totalPolicies={1}
            testResult={errorResult}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});
