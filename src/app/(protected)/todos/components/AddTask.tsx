"use client";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {supabase} from "@/lib/supabase-client";
import {schema} from "../schema/schema";
import Button from "./Buttons";
import TaskList from "./TaskList";
import type {Task} from "@/lib/type";

type FormInputs={title:string};

export default function AddTask(){
  const {register,handleSubmit,reset,formState:{errors}}=useForm<FormInputs>({
    resolver:yupResolver(schema),
  });

  const [tasks,setTasks]=useState<Task[]>([]);

  // Fetch todos 
  useEffect(()=>{
    const fetchTodos=async()=>{
      const{data,error}=await supabase
        .from("todos")
        .select("*")
         .order("created_at",{ascending:false});

        if(error) console.error("Fetch todos error:", error.message);
      else setTasks(data || []);
    };

    fetchTodos();
  }, []);

  // Add new task
  const addTask=async(title:string)=>{
    const{data:{user}}=await supabase.auth.getUser();
    if(!user) return alert("You must be logged in");

    const{data,error}=await supabase
      .from("todos")
      .insert([{title,is_completed:false, user_id:user.id }])
      .select();

    if(error) {
      console.error("Insert error:", error.message);
      return;
    }

    if(data && data.length > 0){
      //Adding new task 
      const newTask=data[0] as Task;
setTasks(prev=>[newTask, ...prev]);
console.log("Task added:", newTask); 
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(async(data)=>{
          await addTask(data.title);
           reset();
        })}
        className="flex flex-col max-w-md w-full"
      >
        <label className="text-gray-700 mb-3 mt-10">Write your task</label>
        <input {...register("title")} placeholder="Add your task" className="border p-3" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        <Button type="submit" className="bg-blue-400 p-2 rounded-lg mt-5 text-white w-full">
          Add
        </Button>
      </form>

      <TaskList tasks={tasks} setTasks={setTasks}/>
    </>
  );
}
