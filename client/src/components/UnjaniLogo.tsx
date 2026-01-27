export function UnjaniLogo({ onClick, className = "" }: { onClick?: () => void; className?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`relative w-12 h-12 cursor-pointer flex items-center justify-center ${className}`}
    >
      {/* Logo Image */}
      <img 
        src="/unjani-logo.webp" 
        alt="Unjani Clinic" 
        className="w-full h-full object-contain"
      />
      
      {/* "George" Text Overlay */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-red-600 px-1.5 py-0.5">
        <span className="text-xs font-bold text-white">GEORGE</span>
      </div>
    </div>
  );
}
