import { useState } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { ListPage } from "@/components/ListPage";
import { generateListId } from "@/utils/listGenerator";

const STORAGE_KEY = "homifyapt-list-history";

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'list'>('welcome');
  const [listId, setListId] = useState<string>('');

  const handleStartList = () => {
    const newListId = generateListId();
    
    // Update list history
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedLists = stored ? JSON.parse(stored) : [];
    const updatedLists = [newListId, ...storedLists.filter(list => list !== newListId)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
    
    setListId(newListId);
    setCurrentView('list');
  };

  const handleJoinList = (code: string) => {
    setListId(code);
    setCurrentView('list');
  };

  const handleBack = () => {
    setCurrentView('welcome');
    setListId('');
  };

  if (currentView === 'list') {
    return <ListPage listId={listId} onBack={handleBack} />;
  }

  return (
    <WelcomePage 
      onStartList={handleStartList}
      onJoinList={handleJoinList}
    />
  );
};

export default Index;
