import React from "react";
import { Trash2 } from "lucide-react";
import Button from "./Buttons";

type Props = {
  id: number;
  handleDelete: (id: number) => void;
};

const DeleteTask: React.FC<Props> = ({ id, handleDelete }) => {
  return (
    <Button onClick={() => handleDelete(id)} className="ml-2">
      <Trash2 size={18} />
    </Button>
  );
};

export default DeleteTask;
