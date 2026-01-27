import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useDispensary } from "@/contexts/DispensaryContext";
import { useLocation } from "wouter";
import { UnjaniLogoLarge } from "@/components/UnjaniLogoLarge";

export default function Home() {
  const { user, loading } = useAuth();
  const { setSelectedDispensary, dispensaries } = useDispensary();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the system</p>
        </div>
      </div>
    );
  }

  const handleDispensarySelect = (dispensaryId: number) => {
    const dispensary = dispensaries.find(d => d.id === dispensaryId);
    if (dispensary) {
      setSelectedDispensary(dispensary);
      setLocation("/stock-list");
    }
  };

  const mainClinic = dispensaries.find(d => d.type === "main_clinic");
  const podMobile = dispensaries.find(d => d.type === "pod_mobile");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Blue Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <UnjaniLogoLarge />
            <div>
              <h1 className="text-3xl font-bold">Stock Management System</h1>
              <p className="text-blue-100">Unjani Clinic George</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Welcome</p>
            <p className="text-blue-100">{user.name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Select Dispensary</h2>
            <p className="text-lg text-gray-600">Choose which dispensary you want to manage</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Clinic Dispensary */}
            {mainClinic && (
              <button
                onClick={() => handleDispensarySelect(mainClinic.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-blue-900"
              >
                <div className="flex items-center justify-center w-24 h-24 bg-blue-900 rounded-full mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Main Clinic Dispensary</h3>
                <p className="text-gray-600 mb-6">Primary dispensary stock</p>
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Access Dispensary
                </Button>
              </button>
            )}

            {/* POD Mobile Clinic */}
            {podMobile && (
              <button
                onClick={() => handleDispensarySelect(podMobile.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-red-600"
              >
                <div className="flex items-center justify-center w-24 h-24 bg-red-600 rounded-full mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">POD Mobile Clinic Dispensary</h3>
                <p className="text-gray-600 mb-6">Mobile clinic dispensary stock</p>
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Access Dispensary
                </Button>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
