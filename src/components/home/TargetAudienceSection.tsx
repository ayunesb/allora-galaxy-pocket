
export const TargetAudienceSection = () => {
  const audiences = ['Founders', 'Agencies', 'DTC Brands', 'E-Commerce', 'Creators'];
  
  return (
    <div className="mt-12 md:mt-16 text-center">
      <h2 className="text-lg font-semibold mb-4">Built for</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {audiences.map((tag) => (
          <span 
            key={tag}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
