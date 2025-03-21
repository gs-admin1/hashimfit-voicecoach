
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Dumbbell, 
  User, 
  Calendar, 
  ChevronRight, 
  Mic, 
  Zap,
  Weight,
  ChartBar,
  LucideProps
} from "lucide-react";

export const AnimatedCard = ({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string,
  delay?: number 
}) => {
  return (
    <div 
      className={cn(
        "hashim-card", 
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: `scale-in 0.5s ease-out ${delay}ms backwards` 
      }}
    >
      {children}
    </div>
  );
};

export const IconButton = ({ 
  icon: Icon, 
  onClick, 
  label,
  variant = "primary",
  size = "md",
  className,
}: { 
  icon: React.ComponentType<LucideProps>, 
  onClick?: () => void,
  label?: string,
  variant?: "primary" | "secondary" | "outline" | "ghost",
  size?: "sm" | "md" | "lg",
  className?: string,
}) => {
  const baseClasses = "rounded-full flex items-center justify-center transition-all duration-300";
  
  const variantClasses = {
    primary: "bg-hashim-600 hover:bg-hashim-700 text-white",
    secondary: "bg-hashim-100 hover:bg-hashim-200 text-hashim-800",
    outline: "border border-hashim-500 hover:bg-hashim-50 text-hashim-600",
    ghost: "hover:bg-hashim-50 text-hashim-600",
  };
  
  const sizeClasses = {
    sm: label ? "p-2 text-sm" : "p-2",
    md: label ? "p-2.5 text-base" : "p-2.5",
    lg: label ? "p-3 text-lg" : "p-3",
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} strokeWidth={2} />
      {label && <span className="ml-2">{label}</span>}
    </button>
  );
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<LucideProps>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}) => {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  };

  return (
    <AnimatedCard className={cn("flex flex-col", className)}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-hashim-50 dark:bg-hashim-900/20 rounded-full">
          <Icon className="text-hashim-600" size={18} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold">{value}</h3>
        {trend && trendValue && (
          <p className={cn("text-sm font-medium", trendColors[trend])}>
            {trendValue}
          </p>
        )}
      </div>
    </AnimatedCard>
  );
};

export const NavigationItem = ({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ComponentType<LucideProps>;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center p-3 rounded-xl w-full transition-all duration-300",
        active
          ? "bg-hashim-50 dark:bg-hashim-900/20 text-hashim-700 dark:text-hashim-300"
          : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      <Icon size={20} className={active ? "text-hashim-600" : ""} />
      <span className="ml-3 font-medium">{label}</span>
      {active && <ChevronRight size={18} className="ml-auto text-hashim-600" />}
    </button>
  );
};

export const Chip = ({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
        active
          ? "bg-hashim-600 text-white"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
    </button>
  );
};

export function VoiceWidget() {
  const [listening, setListening] = useState(false);
  
  const toggleListening = () => {
    setListening(!listening);
    // Here would go actual voice recording logic
    setTimeout(() => {
      if (!listening) {
        setListening(false);
      }
    }, 5000);
  };
  
  return (
    <div className="flex items-center justify-center my-4">
      <button
        onClick={toggleListening}
        className={cn(
          "relative rounded-full p-5 shadow-lg transition-all duration-500",
          listening 
            ? "bg-hashim-600 microphone-ripple" 
            : "bg-hashim-500 hover:bg-hashim-600"
        )}
      >
        <Mic 
          size={32} 
          className="text-white" 
          strokeWidth={listening ? 2.5 : 2}
        />
        {listening && (
          <div className="absolute inset-0 rounded-full animate-ripple bg-hashim-500 opacity-20"></div>
        )}
      </button>
      <div className="ml-4">
        <p className="font-medium">
          {listening ? "Listening..." : "Log workout with voice"}
        </p>
        <p className="text-sm text-muted-foreground">
          {listening 
            ? "Speak now to log your exercise" 
            : "Tap the mic and speak"
          }
        </p>
      </div>
    </div>
  );
}

export function IconBox({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ComponentType<LucideProps>;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center p-4", className)}>
      <div className="p-3 rounded-full bg-hashim-50 dark:bg-hashim-900/20 mb-2">
        <Icon size={24} className="text-hashim-600" />
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function NavigationBar() {
  const navItems = [
    { icon: Activity, label: "Dashboard" },
    { icon: Dumbbell, label: "Workouts" },
    { icon: Calendar, label: "Planner" },
    { icon: ChartBar, label: "Progress" },
    { icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-4 py-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <IconBox
            key={item.label}
            icon={item.icon}
            label={item.label}
            className="px-2"
          />
        ))}
      </div>
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
