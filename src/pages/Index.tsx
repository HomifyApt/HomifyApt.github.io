import { useState } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { ListPage } from "@/components/ListPage";
import { generateListId } from "@/utils/listGenerator";

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'list'>('welcome');
  const [listId, setListId] = useState<string>('');

  const handleStartList = () => {
    const newListId = generateListId();
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
