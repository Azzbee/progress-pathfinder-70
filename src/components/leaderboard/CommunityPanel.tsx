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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="heading-serif text-lg text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          COMMUNITIES
        </h3>
        
        <div className="flex gap-2">
          {/* Join Community Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                JOIN
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="heading-serif text-primary">JOIN_COMMUNITY</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    INVITE_CODE:
                  </label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter invite code..."
                    className="terminal-input"
                  />
                </div>
                <Button 
                  className="w-full matrix-btn"
                  onClick={() => {
                    onJoinCommunity(joinCode);
                    setJoinCode('');
                  }}
                  disabled={!joinCode}
                >
                  JOIN_COMMUNITY
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Community Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs">
                <Plus className="w-4 h-4 mr-1" />
                CREATE
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="heading-serif text-primary">CREATE_COMMUNITY</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    COMMUNITY_NAME:
                  </label>
                  <Input
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    placeholder="Enter name..."
                    className="terminal-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    VISIBILITY:
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPublic(true)}
                      className={cn(
                        "flex-1 p-3 border transition-all",
                        isPublic 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-primary/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <Globe className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">PUBLIC</span>
                    </button>
                    <button
                      onClick={() => setIsPublic(false)}
                      className={cn(
                        "flex-1 p-3 border transition-all",
                        !isPublic 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-primary/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <Lock className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">PRIVATE</span>
                    </button>
                  </div>
                </div>
                <Button 
                  className="w-full matrix-btn"
                  onClick={() => {
                    onCreateCommunity(newCommunityName, isPublic);
                    setNewCommunityName('');
                  }}
                  disabled={!newCommunityName}
                >
                  CREATE_COMMUNITY
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Community List */}
      <div className="space-y-2">
        {communities.map((community, index) => (
          <div 
            key={community.id}
            className={cn(
              "glass-card p-4 flex items-center justify-between animate-fade-in-up",
              `stagger-${index + 1}`
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-primary/50 flex items-center justify-center">
                {community.isPublic ? (
                  <Globe className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <span className="font-mono text-card-foreground">{community.name}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {community.memberCount} members
                  {community.yourRank && (
                    <>
                      <span>•</span>
                      <span>Rank #{community.yourRank}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopyCode(community.id)}
              className="p-2 hover:bg-primary/10 transition-colors"
              title="Copy invite code"
            >
              {copiedId === community.id ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        ))}

        {communities.length === 0 && (
          <div className="glass-card p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground font-mono text-sm">
              // NO_COMMUNITIES_JOINED
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Join or create a community to compete with others.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
