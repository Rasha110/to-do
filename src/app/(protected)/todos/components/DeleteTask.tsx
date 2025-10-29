import React from "react";
import {Trash2} from "lucide-react";
import Button from "./Buttons";
import type {Task} from "@/lib/type";
import {supabase} from "@/lib/supabase-client"

type Props= {
  task:Task;
  tasks:Task[];
  setTasks:React.Dispatch<React.SetStateAction<Task[]>>;
};

const DeleteTask:React.FC<Props>=({task,tasks,setTasks})=>{

    const handleDelete=async()=>{
        await supabase.from("todos").delete().eq("id",task.id);
           setTasks(tasks.filter(t => 
            t.id!==task.id
        ));
         console.log("Task deleted:", task);
      };
      

  return (
    <Button onClick={handleDelete} className="ml-2">
 <Trash2 size={18}/>
    </Button>
  );
};

export default DeleteTask;