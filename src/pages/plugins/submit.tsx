
import React from "react";
import SubmitHeader from "./submit/SubmitHeader";
import PluginSubmitForm from "./submit/PluginSubmitForm";

export default function PluginSubmitPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <SubmitHeader />
      <PluginSubmitForm />
    </div>
  );
}
