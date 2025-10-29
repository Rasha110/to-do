import AddTask from "./components/AddTask";

export default function TodosPage(){
  return(
    <div className="flex flex-col items-center p-10">
        <h1 className="text-2xl font-semibold mb-4">My Todos</h1>
      <AddTask />
 </div>
  );
}
