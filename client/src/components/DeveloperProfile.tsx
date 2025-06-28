import { useState, useEffect } from "react";
import { X, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DeveloperProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeveloperProfile({ isOpen, onClose }: DeveloperProfileProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card 
        className={`relative w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transform transition-all duration-300 ${
          mounted 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tim Developer
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Web Developer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Web Developer</span>
              <Badge variant="secondary" className="ml-auto">Frontend & Backend</Badge>
            </div>
            
            <div className="ml-7 space-y-2">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nama:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">Danixren</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp:</span>
                <a 
                  href="https://wa.me/6281249578370" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-medium">+62 812-4957-8370</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bot Developer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Bot Developer</span>
              <Badge variant="secondary" className="ml-auto">WhatsApp Bot</Badge>
            </div>
            
            <div className="ml-7 space-y-2">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nama:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">Alex</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp:</span>
                <a 
                  href="https://wa.me/6285123456789" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-medium">+62 851-2345-6789</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Hubungi kami jika ada pertanyaan atau masalah
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}