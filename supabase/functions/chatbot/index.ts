import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Generate embedding
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) throw new Error(`Embedding failed: ${response.statusText}`);
    const data = await response.json();
    return data.data?.[0]?.embedding ?? [];
  } catch (err) {
    console.error("Embedding error:", err);
    return [];
  }
}

// Call OpenAI
async function callOpenAI(systemPrompt: string, userQuery: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI failed: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

const jsonResponse = (body: any, status = 200) => 
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    const { user_id, query } = body;
    if (!user_id || !query) {
      return jsonResponse({ error: "user_id and query required" }, 400);
    }

    // Fetch todos
    const { data: todos, error: todosErr } = await supabase
      .from("todos")
      .select("id, title, is_completed, created_at, updated_at, notes")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (todosErr) throw todosErr;

    if (!todos || todos.length === 0) {
      return jsonResponse({ reply: "You don't have any todos yet. Create some tasks to get started!" });
    }

    // Calculate statistics
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.is_completed).length;
    const pendingTodos = totalTodos - completedTodos;

    // Time periods
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filter by period
    const todaysTodos = todos.filter(t => new Date(t.created_at) >= todayStart);
    const thisWeekTodos = todos.filter(t => new Date(t.created_at) >= weekStart);
    const thisMonthTodos = todos.filter(t => new Date(t.created_at) >= monthStart);

    const completedToday = todaysTodos.filter(t => t.is_completed).length;
    const completedThisWeek = thisWeekTodos.filter(t => t.is_completed).length;
    const completedThisMonth = thisMonthTodos.filter(t => t.is_completed).length;

    // Format todos
    const formatTodo = (t: any) => {
      const date = new Date(t.created_at).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      const status = t.is_completed ? "DONE" : "PENDING";
      const notes = t.notes ? ` (${t.notes})` : "";
      return `${status} - "${t.title}" (${date})${notes}`;
    };

    const recentTodos = todos.slice(0, 10).map(formatTodo).join("\n");

    const completedList = todos
      .filter(t => t.is_completed && t.updated_at)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map(t => {
        const date = new Date(t.updated_at).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        return `- "${t.title}" - ${date}`;
      })
      .join("\n");

    // Build context
    const completionPercent = ((completedTodos / totalTodos) * 100).toFixed(1);
    const contextData = `
STATS:
- Total: ${totalTodos}
- Completed: ${completedTodos} (${completionPercent}%)
- Pending: ${pendingTodos}

TIME PERIODS:
- Today: ${todaysTodos.length} created (${completedToday} done)
- This Week: ${thisWeekTodos.length} created (${completedThisWeek} done)
- This Month: ${thisMonthTodos.length} created (${completedThisMonth} done)

RECENT TODOS:
${recentTodos}

COMPLETED TODOS:
${completedList || "None yet"}`;

    const systemPrompt = `You are a helpful Todo Assistant. Answer questions about tasks using ONLY the provided data.
Be friendly, specific with numbers and dates. Never make up information.`;

    // Get AI response
    const aiResponse = await callOpenAI(systemPrompt, `${contextData}\n\nUser: ${query}`);

    // Save to database (async)
    generateEmbedding(query).then(embedding => {
      supabase.from("ai_chat_history").insert([{
        user_id,
        query,
        response: aiResponse,
        embedding: embedding.length > 0 ? embedding : null,
        todo_context: {
          stats: { total: totalTodos, completed: completedTodos, pending: pendingTodos },
          period_breakdown: { today: completedToday, this_week: completedThisWeek, this_month: completedThisMonth },
        },
      }]).catch(err => console.error("Failed to save:", err));
    });

    return jsonResponse({ reply: aiResponse });

  } catch (err) {
    console.error("Error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: msg, reply: "Something went wrong. Try again." }, 500);
  }
});