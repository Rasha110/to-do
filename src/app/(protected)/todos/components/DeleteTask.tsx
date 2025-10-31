import React from "react";
import { Trash2 } from "lucide-react";
import Button from "./Buttons";
import type { Task } from "@/lib/type";
import { supabase } from "@/lib/supabase-client";
import { useEffect } from "react";
type Props = {
  task: Task;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const DeleteTask: React.FC<Props> = ({ task, tasks, setTasks }) => {
  const handleDelete = async () => {
    await supabase.from("todos").delete().eq("id", task.id);
    setTasks(tasks.filter((t) => t.id !== task.id));
    console.log("Task deleted:", task);
  };
  useEffect(() => {
    const channel = supabase
      .channel("todos-deletes")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "todos",
        },
        (payload) => {
          const deletedTask = payload.old as Task;
          setTasks((prev) => prev.filter((t) => t.id !== deletedTask.id));
          console.log("Realtime task deleted:", deletedTask);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up subscription on unmount
    };
  }, [setTasks]);

  return (
    <Button
      onClick={handleDelete}
      size="sm" 
      variant="danger" 
      className="ml-2 p-2 flex items-center justify-center"
    >
      <Trash2 size={15} />
    </Button>
  );
};

export default DeleteTask;
