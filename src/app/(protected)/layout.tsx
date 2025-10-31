"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { CheckCircle2, LogOut, User } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check auth status
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
      } else {
        setUser(user);
      }
    };

    checkUser();


    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!session) router.push("/signin");
        else setUser(session.user);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading user session...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
     
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/todos")}
          >
            <CheckCircle2 className="text-blue-600 w-7 h-7" />
            <h1 className="text-xl font-bold">My Todo App</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-semibold"
            >
              {user.email?.[0]?.toUpperCase()}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-55 bg-white border rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    router.push("/profile");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

    
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
