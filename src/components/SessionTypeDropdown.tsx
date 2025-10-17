import { Play, MessageSquare, Presentation, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionType } from "@/types/speech";

interface SessionTypeDropdownProps {
  onSelectType: (type: SessionType) => void;
  className?: string;
}

const SessionTypeDropdown = ({ onSelectType, className }: SessionTypeDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 animate-bounce-in ${className}`}
        >
          <Play className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 animate-scale-in" align="start">
        <DropdownMenuItem 
          className="cursor-pointer transition-smooth hover:bg-accent flex items-center gap-3 p-3"
          onClick={() => onSelectType('debate')}
        >
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Debate Mode</div>
            <div className="text-xs text-muted-foreground">Practice argumentative skills</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer transition-smooth hover:bg-accent flex items-center gap-3 p-3"
          onClick={() => onSelectType('presentation')}
        >
          <Presentation className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Presentation Mode</div>
            <div className="text-xs text-muted-foreground">Deliver structured presentations</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer transition-smooth hover:bg-accent flex items-center gap-3 p-3"
          onClick={() => onSelectType('speech')}
        >
          <Mic className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Speech Mode</div>
            <div className="text-xs text-muted-foreground">General public speaking</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SessionTypeDropdown;
