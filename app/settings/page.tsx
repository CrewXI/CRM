'use client';

import { GetUID } from "../../components/debug/get-uid";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="max-w-md">
        <GetUID />
      </div>
    </div>
  );
}
