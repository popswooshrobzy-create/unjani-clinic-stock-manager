export function UnjaniLogoLarge() {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Logo Image */}
      <img 
        src="/unjani-logo.webp" 
        alt="Unjani Clinic" 
        className="w-full h-full object-contain"
      />
      
      {/* "George" Text Overlay */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-red-600 px-3 py-1">
        <span className="text-sm font-bold text-white">GEORGE</span>
      </div>
    </div>
  );
}
