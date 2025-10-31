"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Button from "./Buttons";
import type { Task } from "@/lib/type";

interface UpdateTaskProps {
  task: Task;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function UpdateTask({ task, tasks, setTasks }: UpdateTaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("todos").update({ title }).eq("id", task.id);

    if (error) {
      console.error("Error updating task:", error.message);
    } else {
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, title } : t)));
      setIsEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="ml-2 flex items-center gap-2">
      {isEditing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-1 rounded text-black outline-none focus:ring-2 focus:ring-blue-500"
          />


          <Button onClick={handleUpdate} variant="primary" size="sm"  className="p-1">
            {loading ? "Saving..." : "Save"}
          </Button>

      
          <Button
            onClick={() => {
              setIsEditing(false);
              setTitle(task.title);
            }}
            variant="secondary"
            className="p-1"
            size="sm"
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button onClick={() => setIsEditing(true)} variant="primary" size="sm" className="p-1">
          Edit
        </Button>
      )}
    </div>
  );
}
