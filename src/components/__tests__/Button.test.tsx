
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { describe, it, expect } from "vitest";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies default styles", () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByText("Test Button");
    expect(button).toHaveClass("inline-flex", "items-center", "justify-center");
  });

  it("applies variant styles", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText("Delete");
    expect(button).toHaveClass("bg-destructive", "text-destructive-foreground");
  });
});
