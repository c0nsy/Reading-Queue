import { toolbarReducer } from "@/app/reducers/toolbarReducer";
import { ToolbarDispatch, ToolbarState } from "@/app/types/Toolbar";
import { createContext, useReducer, useState } from "react";

export const defaultToolbarFilters: ToolbarState = {
  search: "",
  sort: "date",
  status: "all",
  tags: [],
};

export const ToolbarDispatchContext = createContext<ToolbarDispatch>(() => {});
export const ToolbarStateContext = createContext<ToolbarState>(
  defaultToolbarFilters,
);

export function ToolbarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toolbarReducer, defaultToolbarFilters);
  return (
    <ToolbarDispatchContext.Provider value={dispatch}>
      <ToolbarStateContext.Provider value={state}>
        {children}
      </ToolbarStateContext.Provider>
    </ToolbarDispatchContext.Provider>
  );
}
