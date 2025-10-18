import { ReactNode, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Props {
  children?: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useLocalStorage('speech-sessions', []);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(sessions[0]?.id);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar
        sessions={sessions}
        onStartSession={() => navigate('/recording-preferences')}
        onSettingsClick={() => setSettingsModalOpen(true)}
        selectedSessionId={selectedSessionId}
        onSelectSession={setSelectedSessionId}
        onSessionsUpdate={setSessions}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children ?? <Outlet />}
      </div>
    </div>
  );
};

export default RootLayout;
