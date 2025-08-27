import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Plus, Users } from "lucide-react";

interface WelcomePageProps {
  onStartList: () => void;
  onJoinList: (code: string) => void;
}

export function WelcomePage({ onStartList, onJoinList }: WelcomePageProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinList(joinCode.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">FurniList</h1>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}