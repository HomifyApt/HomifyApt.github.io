import { useState, useEffect } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { ListPage } from "@/components/ListPage";
import { generateListId } from "@/utils/listGenerator";
import { AppData, APP_STORAGE_KEY } from "@/types/furniture";

const STORAGE_KEY = "homifyapt-list-history";

interface ListHistoryItem {
  id: string;
  handle: string;
  displayName: string;
  lastAccessed: number; // timestamp
  lastUpdated: number; // timestamp for content updates
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'list'>('welcome');
  const [listId, setListId] = useState<string>('');

  // Function to update history with new access time
  const updateListHistory = (handle: string, displayName: string, isContentUpdate = false) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedLists: ListHistoryItem[] = stored ? JSON.parse(stored) : [];
    const now = Date.now();
    
    // Remove existing entry if present
    const filteredLists = storedLists.filter(list => list.handle !== handle);
    
    // Get the list data from app data to ensure we have the correct UUID
    const appDataStr = localStorage.getItem(APP_STORAGE_KEY);
    const appData: AppData = appDataStr ? JSON.parse(appDataStr) : { lists: {} };
    const listData = appData.lists[handle];
    
    // Create new entry
    const updatedList: ListHistoryItem = {
      id: listData?.id || handle, // Use UUID if available, fallback to handle for backwards compatibility
      handle,
      displayName: displayName || handle,
      lastAccessed: now,
      lastUpdated: isContentUpdate ? now : (storedLists.find(l => l.handle === handle)?.lastUpdated || now)
    };
    
    // Add to front of list and limit to 5 items
    const updatedLists = [updatedList, ...filteredLists].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
  };

  // Function to update list displayName in history
  const updateListDisplayNameInHistory = (handle: string, newDisplayName: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const storedLists: ListHistoryItem[] = JSON.parse(stored);
    const listIndex = storedLists.findIndex(list => list.handle === handle);
    
    if (listIndex !== -1) {
      storedLists[listIndex].displayName = newDisplayName;
      storedLists[listIndex].lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLists));
    }
  };

  const handleStartList = () => {
    const newListId = generateListId();
    
    // Get the list data from app data
    const appDataStr = localStorage.getItem(APP_STORAGE_KEY);
    const appData: AppData = appDataStr ? JSON.parse(appDataStr) : { lists: {} };
    const listData = appData.lists[newListId];
    
    updateListHistory(newListId, listData?.displayName || newListId);
    
    setListId(newListId);
    setCurrentView('list');
  };

  const handleJoinList = (handle: string) => {
    // Get the list data from app data
    const appDataStr = localStorage.getItem(APP_STORAGE_KEY);
    const appData: AppData = appDataStr ? JSON.parse(appDataStr) : { lists: {} };
    const listData = appData.lists[handle];
    
    updateListHistory(handle, listData?.displayName || handle);
    
    setListId(handle);
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
        onHeaderUpdate={(newDisplayName) => updateListDisplayNameInHistory(listId, newDisplayName)}
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
