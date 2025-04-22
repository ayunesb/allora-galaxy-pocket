
import PluginSubmitForm from "./submit/PluginSubmitForm";
import React from "react";

export default function PluginSubmitPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">🚀 Submit a Plugin</h1>
      <PluginSubmitForm />
    </div>
  );
}
