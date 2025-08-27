import { useState, useEffect } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { ListPage } from "@/components/ListPage";
import { generateListId } from "@/utils/listGenerator";
import { AppData, APP_STORAGE_KEY } from "@/types/furniture";

const STORAGE_KEY = "homifyapt-list-history";

interface ListHistoryItem {
  id: string;
  header: string;
  lastAccessed: number; // timestamp
  lastUpdated: number; // timestamp for content updates
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'list'>('welcome');
  const [listId, setListId] = useState<string>('');

  // Function to update history with new access time
  const updateListHistory = (id: string, header: string, isContentUpdate = false) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedLists: ListHistoryItem[] = stored ? JSON.parse(stored) : [];
    const now = Date.now();
    
    // Remove existing entry if present
    const filteredLists = storedLists.filter(list => list.id !== id);
    
    // Create new entry
    const updatedList: ListHistoryItem = {
      id,
      header,
      lastAccessed: now,
      lastUpdated: isContentUpdate ? now : (storedLists.find(l => l.id === id)?.lastUpdated || now)
    };
    
    // Add to front of list and limit to 5 items
    const updatedLists = [updatedList, ...filteredLists].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
  };

  // Function to update list header in history
  const updateListHeaderInHistory = (id: string, newHeader: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const storedLists: ListHistoryItem[] = JSON.parse(stored);
    const listIndex = storedLists.findIndex(list => list.id === id);
    
    if (listIndex !== -1) {
      storedLists[listIndex].header = newHeader;
      storedLists[listIndex].lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLists));
    }
  };

  const handleStartList = () => {
    const newListId = generateListId();
    
    // Get the list header from app data
    const appDataStr = localStorage.getItem(APP_STORAGE_KEY);
    const appData: AppData = appDataStr ? JSON.parse(appDataStr) : { lists: {} };
    const listHeader = appData.lists[newListId]?.header || newListId;
    
    updateListHistory(newListId, listHeader);
    
    setListId(newListId);
    setCurrentView('list');
  };

  const handleJoinList = (code: string) => {
    // Get the list header from app data
    const appDataStr = localStorage.getItem(APP_STORAGE_KEY);
    const appData: AppData = appDataStr ? JSON.parse(appDataStr) : { lists: {} };
    const listHeader = appData.lists[code]?.header || code;
    
    updateListHistory(code, listHeader);
    
    setListId(code);
    setCurrentView('list');
  };

  const handleBack = () => {
    setCurrentView('welcome');
    setListId('');
  };

  if (currentView === 'list') {
    return (
      <ListPage 
        listId={listId} 
        onBack={handleBack}
        onHeaderUpdate={(newHeader) => updateListHeaderInHistory(listId, newHeader)}
        onContentUpdate={() => updateListHistory(listId, '', true)}
      />
    );
  }

  return (
    <WelcomePage 
      onStartList={handleStartList}
      onJoinList={handleJoinList}
    />
  );
};

export default Index;
