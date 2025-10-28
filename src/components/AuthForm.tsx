"use client"

import {useState} from "react"
import {supabase} from "@/lib/supabase-client"
import {useRouter} from "next/navigation"

interface AuthFormProps{
  mode: "login" | "signup"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit=async(e:React.FormEvent)=>{
e.preventDefault();
setLoading(true);
setError("");
if(mode==="signup"){
    const {error,data}=await supabase.auth.signUp({email,password})
    if(error) setError(error.message);
    else router.push("/todos");
}
else{
    const {error,data}=await supabase.auth.signInWithPassword({email,password})
    if(error) setError(error.message);
    else router.push("/todos");
}
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{mode === "signup" ? "Sign Up" : "Login"}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border mb-4 rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border mb-4 rounded"
        required
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Login"}
      </button>
    </form>
  )
}
