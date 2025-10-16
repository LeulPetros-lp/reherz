import { Settings as SettingsIcon, Play, Trash2 } from "lucide-react";
import { SpeechSession } from "@/types/speech";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "./Logo";

import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
  sessions: SpeechSession[];
  onStartSession: () => void;
  onSettingsClick: () => void;
  selectedSessionId?: string;
  onSelectSession?: (id: string) => void;
  onSessionsUpdate?: (updated: SpeechSession[]) => void;
}

const AppSidebar = ({
  sessions,
  onStartSession,
  onSettingsClick,
  selectedSessionId,
  onSelectSession,
  onSessionsUpdate,
}: AppSidebarProps) => {
  const navigate = useNavigate();

  // Handle deletion from localStorage and UI
  const handleDeleteSession = (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    const stored = localStorage.getItem("speechSessions");
    if (!stored) return;

    const parsed = JSON.parse(stored) as SpeechSession[];
    const updated = parsed.filter((s) => s.id !== id);
    localStorage.setItem("speechSessions", JSON.stringify(updated));

    // Update parent or trigger UI refresh
    onSessionsUpdate?.(updated);
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
        <Logo />
        <div
          onClick={onSettingsClick}
          className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
        >
          <SettingsIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </div>
      </div>

      {/* Sessions Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-t border-sidebar-border">
          <h3 className="text-sm font-semibold text-sidebar-foreground">
            Recent Sessions
          </h3>
        </div>

        <ScrollArea className="flex-1 px-2">
          {sessions.length === 0 ? (
            // Empty State
            <div className="flex flex-col gap-4">
              <div className="p-4 text-center text-sm text-muted-foreground">
                No sessions yet
              </div>
              <div className="px-4">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate("/recording-preferences")}
                >
                  <Play className="w-4 h-4 mr-2" />
                  New Session
                </Button>
              </div>
            </div>
          ) : (
            // Sessions List
            <div className="space-y-1 pb-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative w-full text-left p-3 rounded-md transition-colors ${
                    selectedSessionId === session.id
                      ? "bg-secondary text-foreground"
                      : "hover:bg-secondary/50 text-sidebar-foreground"
                  }`}
                >
                  <button
                    onClick={() => onSelectSession?.(session.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {session.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {session.score.overall}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString()} •{" "}
                      {session.duration}m
                    </div>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* New Session Button */}
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                onClick={() => navigate("/recording-preferences")}
              >
                <Play className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
};

export default AppSidebar;
