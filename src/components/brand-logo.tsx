export function BrandLogo({ className = "h-8 w-8 text-sm" }: { className?: string }) {
  return (
    <div
      className={`rounded-[9px] bg-gradient-to-br from-[#b4c6ff] via-[#9eb7ff] to-[#86a5ff] text-zinc-950 font-black flex items-center justify-center shadow-md shadow-indigo-500/20 select-none shrink-0 ${className}`}
    >
      H
    </div>
  );
}
