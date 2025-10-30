
// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <h1 className="text-4xl font-bold mb-6">Welcome to My Todo App</h1>
      <p className="mb-6 text-gray-700">Organize your tasks efficiently and never forget anything!</p>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push("/signin")}
      >
        Get Started
      </button>
    </div>
  );
}
