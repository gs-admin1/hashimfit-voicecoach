
import { useState } from "react";
import { BrainCog } from "lucide-react";
import { Button } from "./ui/button";
import { ChatInterface } from "./ChatInterface";

export function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-20 right-4 sm:right-6 z-40 rounded-full w-14 h-14 p-0 shadow-lg ${
          isOpen ? "bg-hashim-700" : "bg-hashim-600 hover:bg-hashim-700"
        }`}
      >
        <BrainCog size={24} className={isOpen ? "text-white" : ""} />
      </Button>
      
      <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
