
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "./ui/button";
import { ChatInterface } from "./ChatInterface";

export function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-24 right-4 sm:right-6 z-50 rounded-full w-14 h-14 p-0 shadow-lg ${
          isOpen ? "bg-hashim-700" : "bg-hashim-600 hover:bg-hashim-700"
        }`}
      >
        <Dumbbell size={24} className={isOpen ? "text-white" : ""} />
      </Button>
      
      <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
