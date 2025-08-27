import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Plus, Users, History, Clock } from "lucide-react";

interface WelcomePageProps {
  onStartList: () => void;
  onJoinList: (code: string) => void;
}

const STORAGE_KEY = "homifyapt-list-history";

interface ListHistoryItem {
  id: string;
  header: string;
  lastAccessed: number;
  lastUpdated: number;
}

function getRelativeTimeString(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function WelcomePage({ onStartList, onJoinList }: WelcomePageProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [storedLists, setStoredLists] = useState<ListHistoryItem[]>([]);
  const [, setUpdateTrigger] = useState(0); // For forcing updates of relative times

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const lists = JSON.parse(stored);
        // Handle both old format (string[]) and new format (ListHistoryItem[])
        setStoredLists(Array.isArray(lists) 
          ? lists.map(item => typeof item === 'string' 
              ? { 
                  id: item, 
                  header: item, 
                  lastAccessed: Date.now(),
                  lastUpdated: Date.now()
                } 
              : item)
          : []);
      } catch {
        setStoredLists([]);
      }
    }
  }, []);

  // Update relative times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      const code = joinCode.trim().toLowerCase();
      onJoinList(code);
    }
  };

  const handleStoredListClick = (code: string) => {
    onJoinList(code);
  };

  const renderListButton = (list: ListHistoryItem) => (
    <Button
      key={list.id}
      variant="ghost"
      className="w-full justify-start text-left bg-gradient-to-r from-muted/50 via-background to-background hover:from-primary/10 hover:via-primary/5 hover:to-background transition-all duration-300"
      onClick={() => handleStoredListClick(list.id)}
    >
      <div className="flex flex-col gap-1 w-full">
        <span className="font-medium">{list.header}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{getRelativeTimeString(list.lastAccessed)}</span>
        </div>
      </div>
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">HomifyApt</h1>
          <p className="text-muted-foreground">Track furniture with your family & friends</p>
        </div>

        {!isJoining ? (
          /* Start or Join Options */
          <div className="space-y-4">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Start a New List</CardTitle>
                <CardDescription>Create a shared furniture tracking list</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={onStartList}
                  className="w-full touch-target gradient-warm"
                  size="lg"
                >
                  Create List
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent/20 transition-colors">
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto bg-accent/20 rounded-xl flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">Join Existing List</CardTitle>
                <CardDescription>Enter a 3-word code to join a list</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setIsJoining(true)}
                  variant="outline"
                  className="w-full touch-target"
                  size="lg"
                >
                  Join List
                </Button>
              </CardContent>
            </Card>

            {storedLists.length > 0 && (
              <Card className="border-2 hover:border-muted/20 transition-colors">
                <CardHeader className="text-center pb-3">
                  <div className="w-12 h-12 mx-auto bg-muted/20 rounded-xl flex items-center justify-center mb-2">
                    <History className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">Recent Lists</CardTitle>
                  <CardDescription>Quick access to your recent lists</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {storedLists.map(renderListButton)}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Join List Form */
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Join List</CardTitle>
              <CardDescription>Enter the 3-word code (e.g., "happy-blue-sofa")</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <Input
                  placeholder="e.g., happy-blue-sofa"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="text-center text-lg"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsJoining(false);
                      setJoinCode("");
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="flex-1 gradient-accent"
                  >
                    Join
                  </Button>
                </div>
              </form>

              {storedLists.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="w-4 h-4" />
                    <span>Recent Lists</span>
                  </div>
                  <div className="space-y-2">
                    {storedLists.map(renderListButton)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}