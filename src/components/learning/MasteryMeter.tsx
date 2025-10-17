

export default function MasteryMeter({ value }: { value: number }) {
  const percent = Math.round(value * 100);
  const color = percent >= 70 ? "from-emerald-500 to-emerald-600" : 
                percent >= 50 ? "from-blue-500 to-blue-600" : 
                "from-orange-500 to-red-500";
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <div>Mastery</div>
        <div className="font-semibold">{percent}%</div>
      </div>
      <div 
        className="w-full h-2 bg-muted rounded-full" 
        role="progressbar" 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-valuenow={percent}
      >
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
}
