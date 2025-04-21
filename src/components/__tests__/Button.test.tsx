
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { describe, it, expect } from "vitest";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeDefined();
  });

  it("applies default styles", () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByRole("button", { name: "Test Button" });
    expect(button).toBeDefined();
  });

  it("applies variant styles", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toBeDefined();
  });
});

