import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispensary } from "@/contexts/DispensaryContext";
import { Building2, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function DispensarySelector() {
  const { showSelector, setShowSelector, dispensaries, selectedDispensary, setSelectedDispensary } = useDispensary();
  const savePreferenceMutation = trpc.dispensary.savePreference.useMutation();

  const handleSelect = (dispensary: any) => {
    setSelectedDispensary(dispensary);
    savePreferenceMutation.mutate({ dispensaryId: dispensary.id });
    setShowSelector(false);
  };

  return (
    <Dialog open={showSelector} onOpenChange={setShowSelector}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Select Dispensary</DialogTitle>
          <DialogDescription className="text-center">
            Choose which dispensary you want to manage
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-6">
          {dispensaries.map((dispensary) => {
            const isMainClinic = dispensary.type === "main_clinic";
            const Icon = isMainClinic ? Building2 : Truck;
            const isSelected = selectedDispensary?.id === dispensary.id;
            
            return (
              <button
                key={dispensary.id}
                onClick={() => handleSelect(dispensary)}
                className={`
                  relative p-6 rounded-lg border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-red-600 bg-red-50 shadow-md' 
                    : 'border-gray-200 hover:border-red-400 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-lg
                    ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{dispensary.name}</h3>
                    <p className="text-sm text-gray-600">{dispensary.description}</p>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
