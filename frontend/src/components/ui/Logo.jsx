// src/components/ui/Logo.jsx
import React from "react";
import { BookOpen } from "lucide-react";

const Logo = ({
  variant = "full",
  className = "",
  showText = true,
  imageSrc = "/Y_SIMS-logo.png",
}) => {
  if (variant === "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={imageSrc}
          alt="YBEGENA SIMS"
          className="w-10 h-10 object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={imageSrc}
        alt="YBEGENA SIMS"
        className="h-10 w-auto object-contain"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-white text-sm sm:text-base leading-tight">
            YBEGENA SIMS
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">
            Student Information Management System
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
