
import { render, screen } from "@testing-library/react";
import { PolicyRow } from "./PolicyRow";
import type { RlsPolicy } from "../../hooks/useRlsData";
import type { AccessTestResult } from "../../hooks/useAccessTests";

describe("PolicyRow", () => {
  const mockPolicy: RlsPolicy = {
    policyname: "test_policy",
    tablename: "test_table",
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
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={true}
        totalPolicies={1}
        testResult={mockTestResult}
      />
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
      <PolicyRow
        policy={insecurePolicy}
        tableName="test_table"
        isFirstPolicy={true}
        totalPolicies={1}
        testResult={mockTestResult}
      />
    );

    expect(screen.getByText("Insecure")).toBeInTheDocument();
  });

  it("renders table name only for first policy in group", () => {
    const { rerender } = render(
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={true}
        totalPolicies={2}
        testResult={mockTestResult}
      />
    );

    expect(screen.getByText("test_table")).toBeInTheDocument();

    rerender(
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={false}
        totalPolicies={2}
        testResult={mockTestResult}
      />
    );

    expect(screen.queryByText("test_table")).not.toBeInTheDocument();
  });

  it("renders access test result only for first policy", () => {
    const { rerender } = render(
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={true}
        totalPolicies={2}
        testResult={mockTestResult}
      />
    );

    expect(screen.getByText(/Allowed \(5 rows\)/)).toBeInTheDocument();

    rerender(
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={false}
        totalPolicies={2}
        testResult={mockTestResult}
      />
    );

    expect(screen.queryByText(/Allowed \(5 rows\)/)).not.toBeInTheDocument();
  });

  it("handles blocked test result", () => {
    const blockedResult: AccessTestResult = {
      tableName: "test_table",
      status: "blocked"
    };

    render(
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={true}
        totalPolicies={1}
        testResult={blockedResult}
      />
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
      <PolicyRow
        policy={mockPolicy}
        tableName="test_table"
        isFirstPolicy={true}
        totalPolicies={1}
        testResult={errorResult}
      />
    );

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });
});
