import { useSortable } from "@dnd-kit/react/sortable";
import { ReactNode } from "react";

export function Sortable({
  id,
  index,
  children,
}: {
  id: string;
  index: number;
  children: ReactNode;
}) {
  const { ref } = useSortable({ id, index });

  return (
    <div
      ref={ref}
      className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
