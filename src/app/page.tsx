// app/page.tsx
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Welcome to Your To-Do App</h1>
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Login</Link>
        <Link href="/signup" className="px-4 py-2 bg-green-600 text-white rounded">Sign Up</Link>
      </div>
    </div>
  )
}
