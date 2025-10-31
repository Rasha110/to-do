"use client";

import React from "react";
import type { Task } from "@/lib/type";
import DeleteTask from "./DeleteTask";
import UpdateTask from "./UpdateTask";
import Button from "./Buttons";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const TaskList: React.FC<Props> = ({ tasks, setTasks }) => {
  const toggleComplete = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !current })
      .eq("id", id);

    if (error) return console.error("Toggle error:", error.message);

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, is_completed: !current } : task
      )
    );
  };

  return (
    <ul className="mt-5 w-full max-w-3xl">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex flex-row mt-5 bg-blue-300 p-4 rounded-lg text-white items-center justify-between min-w-[400px]"
        >
          <span
            onClick={() => toggleComplete(task.id, task.is_completed)}
            className={`flex flex-1 cursor-pointer ${
              task.is_completed ? "line-through text-white/70" : ""
            }`}
          >
            {task.title}
          </span>

          
          <Button
            onClick={() => toggleComplete(task.id, task.is_completed)}
            variant="primary"
            className="ml-2 p-2 flex items-center justify-center"
            size="sm" 
          >
            <Check size={15} />
          </Button>

          {/* Update Task */}
          <UpdateTask task={task} tasks={tasks} setTasks={setTasks} />

          {/* Delete Task */}
          <DeleteTask task={task} tasks={tasks} setTasks={setTasks} />
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
