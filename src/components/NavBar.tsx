"use client"

import Link from "next/link"
import {supabase} from "@/lib/supabase-client"
interface NavBarProps{
  user:any;
}


export default function Navbar({user}:NavBarProps) {
  const handleLogout=async()=>{
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-blue-400 text-white p-4 flex justify-between items-center">
        <div className="font-bold">To-Do App</div>
  <div className="flex gap-4 items-center">
         <Link href="/todos">Todos</Link>
        <Link href="/profile">Profile</Link>
       <button onClick={handleLogout} className="bg-blue-800 px-3 py-1 rounded hover:bg-blue-400">
          Logout
           </button>
       </div>
    </nav>
  )
}
