
import React from "react";
import { LaunchReadinessVerifier } from "@/components/LaunchReadinessVerifier";
import AdminOnly from "@/guards/AdminOnly";

export default function LaunchReadinessPage() {
  return (
    <AdminOnly>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Launch Readiness</h1>
        <LaunchReadinessVerifier />
      </div>
    </AdminOnly>
  );
}
