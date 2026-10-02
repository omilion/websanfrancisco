"use client";

import { createContext, useContext, type ReactNode } from "react";
import { fallbackStores, type Store } from "@/config/site";

const StoresContext = createContext<Store[]>(fallbackStores);

/** Entrega a los componentes de cliente las sucursales que el layout leyó del ERP. */
export function StoresProvider({ stores, children }: { stores: Store[]; children: ReactNode }) {
  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

/** Sucursales visibles en la tienda, en el orden definido en el ERP. */
export function useStores(): Store[] {
  return useContext(StoresContext);
}
