"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode, useEffect } from "react";
import { loadCart } from "../slices/cartSlice";

export function ReduxProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    //   Redux hydrate from db
    store.dispatch(loadCart());
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
