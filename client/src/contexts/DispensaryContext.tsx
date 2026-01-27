import React, { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface Dispensary {
  id: number;
  name: string;
  type: "main_clinic" | "pod_mobile";
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DispensaryContextType {
  selectedDispensary: Dispensary | null;
  setSelectedDispensary: (dispensary: Dispensary | null) => void;
  dispensaries: Dispensary[];
  isLoading: boolean;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
}

const DispensaryContext = createContext<DispensaryContextType | undefined>(undefined);

export function DispensaryProvider({ children }: { children: React.ReactNode }) {
  const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  
  const { data: dispensaries = [], isLoading } = trpc.dispensary.list.useQuery();
  const { data: userPreference } = trpc.dispensary.getUserPreference.useQuery();

  // Auto-select dispensary based on user preference or first available
  useEffect(() => {
    if (!selectedDispensary && dispensaries.length > 0) {
      if (userPreference?.lastSelectedDispensaryId) {
        const preferred = dispensaries.find(d => d.id === userPreference.lastSelectedDispensaryId);
        if (preferred) {
          setSelectedDispensary(preferred);
          return;
        }
      }
      // Default to first dispensary
      setSelectedDispensary(dispensaries[0]);
    }
  }, [dispensaries, userPreference, selectedDispensary]);

  return (
    <DispensaryContext.Provider
      value={{
        selectedDispensary,
        setSelectedDispensary,
        dispensaries,
        isLoading,
        showSelector,
        setShowSelector,
      }}
    >
      {children}
    </DispensaryContext.Provider>
  );
}

export function useDispensary() {
  const context = useContext(DispensaryContext);
  if (context === undefined) {
    throw new Error("useDispensary must be used within a DispensaryProvider");
  }
  return context;
}
