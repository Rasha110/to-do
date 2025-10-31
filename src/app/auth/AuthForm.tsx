"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Button from "../(protected)/todos/components/Buttons";
interface AuthFormProps {
  mode: "login" | "signup";
}
export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
      
        email,
        password,
        options: { data: { full_name: name } },   });
      if (error) setError(error.message);
      else router.push("/todos");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/todos");
    }
    setLoading(false);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        {mode === "signup" ? "Sign Up" : "Sign In"}
      </h2>
      <p className="text-sm text-gray-500">
        {mode === "signup"
          ? "Create a new account to get started"
          : "Enter your email and password to access your account"}
      </p>
      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-90 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} variant="primary" className="w-full">
  {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Sign In"}
</Button>

    </form>
  );
}