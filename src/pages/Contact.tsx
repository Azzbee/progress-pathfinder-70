import AppLayout from '@/components/layout/AppLayout';
import { Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Contact() {
  const supportEmail = 'support@disciplineos.app';

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="heading-display text-3xl text-primary mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Contact Us
          </h1>
          <p className="text-muted-foreground text-sm">
            We'd love to hear from you
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 animate-fade-in-up stagger-2">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="heading-display text-xl text-foreground mb-2">
              Get in Touch
            </h2>
            <p className="text-muted-foreground mb-6">
              Have questions, feedback, or need help? Reach out to our support team.
            </p>

            <div className="glass-card p-6 rounded-2xl mb-6">
              <p className="text-sm text-muted-foreground mb-2">Email us at</p>
              <a 
                href={`mailto:${supportEmail}`}
                className="text-lg font-medium text-primary hover:underline flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                {supportEmail}
              </a>
            </div>

            <Button
              className="w-full"
              onClick={() => window.location.href = `mailto:${supportEmail}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>

            <p className="text-xs text-muted-foreground mt-6">
              We typically respond within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
