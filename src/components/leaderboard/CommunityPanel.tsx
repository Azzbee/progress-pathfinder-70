import { useState } from 'react';
import { Users, Plus, Copy, Check, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Community {
  id: string;
  name: string;
  memberCount: number;
  isPublic: boolean;
  yourRank?: number;
}

interface CommunityPanelProps {
  communities: Community[];
  onJoinCommunity: (code: string) => void;
  onCreateCommunity: (name: string, isPublic: boolean) => void;
}

export default function CommunityPanel({ 
  communities, 
  onJoinCommunity, 
  onCreateCommunity 
}: CommunityPanelProps) {
  const [joinCode, setJoinCode] = useState('');
  const [newCommunityName, setNewCommunityName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="heading-display text-xl text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Communities
        </h3>
        
        <div className="flex gap-2">
          {/* Join Community Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full px-4 text-sm font-medium">
                Join
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="heading-display text-xl text-foreground">Join a Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2 font-medium">
                    Invite Code
                  </label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter invite code..."
                    className="soft-input"
                  />
                </div>
                <Button 
                  className="w-full water-btn"
                  onClick={() => {
                    onJoinCommunity(joinCode);
                    setJoinCode('');
                  }}
                  disabled={!joinCode}
                >
                  Join Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Community Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full px-4 text-sm font-medium">
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="heading-display text-xl text-foreground">Create Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2 font-medium">
                    Community Name
                  </label>
                  <Input
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    placeholder="Enter name..."
                    className="soft-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2 font-medium">
                    Visibility
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsPublic(true)}
                      className={cn(
                        "flex-1 p-4 rounded-2xl border-2 transition-all duration-300",
                        isPublic 
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                          : "border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <Globe className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium block">Public</span>
                    </button>
                    <button
                      onClick={() => setIsPublic(false)}
                      className={cn(
                        "flex-1 p-4 rounded-2xl border-2 transition-all duration-300",
                        !isPublic 
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                          : "border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <Lock className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium block">Private</span>
                    </button>
                  </div>
                </div>
                <Button 
                  className="w-full water-btn"
                  onClick={() => {
                    onCreateCommunity(newCommunityName, isPublic);
                    setNewCommunityName('');
                  }}
                  disabled={!newCommunityName}
                >
                  Create Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Community List */}
      <div className="space-y-3">
        {communities.map((community, index) => (
          <div 
            key={community.id}
            className={cn(
              "glass-card p-5 flex items-center justify-between animate-fade-in-up ripple-effect",
              `stagger-${index + 1}`
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
              )}>
                {community.isPublic ? (
                  <Globe className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <span className="font-semibold text-card-foreground heading-display">{community.name}</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {community.memberCount} members
                  </span>
                  {community.yourRank && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      <span className="text-primary font-medium">Rank #{community.yourRank}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopyCode(community.id)}
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                "hover:bg-primary/10 hover:scale-110"
              )}
              title="Copy invite code"
            >
              {copiedId === community.id ? (
                <Check className="w-5 h-5 text-accent" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        ))}

        {communities.length === 0 && (
          <div className="glass-card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 animate-float">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-semibold heading-display text-lg">
              No communities yet
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Join or create a community to compete with friends and stay motivated together.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}