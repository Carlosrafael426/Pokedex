

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass rounded-3xl p-4 flex flex-col items-center justify-center h-64 animate-pulse relative overflow-hidden">
      <div className="absolute top-2 right-4 w-12 h-8 bg-white/20 rounded-md"></div>
      <div className="w-32 h-32 bg-white/30 rounded-full mb-4 mt-6"></div>
      <div className="h-6 bg-white/30 rounded w-24 mb-3"></div>
      <div className="flex gap-2">
        <div className="w-16 h-6 bg-white/30 rounded-full"></div>
        <div className="w-16 h-6 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
}
