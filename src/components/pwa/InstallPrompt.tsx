import { useState } from 'react';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function InstallPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    canPromptInstall,
    promptInstall,
    getInstallInstructions 
  } = usePWAInstall();
  
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null;

  // Don't show if not installable and not iOS
  if (!isInstallable && !isIOS) return null;

  const instructions = getInstallInstructions();

  const handleInstall = async () => {
    if (canPromptInstall) {
      await promptInstall();
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      {/* Floating install banner */}
      <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden animate-fade-in-up">
        <div className="glass-card rounded-2xl p-4 border border-primary/20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Install DisciplineOS</h3>
              <p className="text-xs text-muted-foreground">
                Get push notifications & offline access
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleInstall}
                className="rounded-xl"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions dialog for iOS */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="heading-display text-primary flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {instructions.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Follow these steps to install DisciplineOS on your device:
            </p>
            <ol className="space-y-3">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground flex items-center gap-2">
                    {step}
                    {index === 0 && isIOS && <Share className="w-4 h-4 text-primary" />}
                    {index === 1 && isIOS && <Plus className="w-4 h-4 text-primary" />}
                  </span>
                </li>
              ))}
            </ol>
            <Button
              className="w-full"
              onClick={() => setShowInstructions(false)}
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}