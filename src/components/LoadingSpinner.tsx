import { Camera, Video } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const LoadingSpinner = ({ size = "md", message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-7 w-7"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Main spinner */}
        <div 
          className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full animate-spin`}
        />
        
        {/* Floating icons */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Camera 
              className={`${iconSize[size]} text-primary animate-pulse absolute -left-8 -top-2 opacity-60`}
              style={{ animationDelay: "0.2s" }}
            />
            <Video 
              className={`${iconSize[size]} text-primary animate-pulse absolute -right-8 -bottom-2 opacity-60`}
              style={{ animationDelay: "0.8s" }}
            />
          </div>
        </div>
      </div>
      
      {message && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};