"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

export default function HomePage() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from("profiles").select("*").limit(1);
      if (error) console.error("❌ Supabase connection failed:", error.message);
      else console.log("✅ Supabase connected!", data);
    };
    testConnection();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold">Welcome to Your To-Do App</h1>
      <p className="text-gray-500 mt-2">Supabase connection test in console ✅</p>
    </main>
  );
}
