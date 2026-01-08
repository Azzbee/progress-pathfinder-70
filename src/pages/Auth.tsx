import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'ACCESS DENIED',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'ACCESS GRANTED',
            description: 'Welcome back, operator.',
          });
        }
      } else {
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'USER EXISTS',
              description: 'This identity is already in the system.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'REGISTRATION FAILED',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'IDENTITY CREATED',
            description: 'Welcome to the system, operator.',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center scanlines matrix-bg p-4">
      <div className="w-full max-w-md">
        {/* Terminal header */}
        <div className="border border-primary p-4 mb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <h1 className="heading-serif text-3xl text-primary matrix-glow text-center">
            DISCIPLINE_OS
          </h1>
          <p className="text-muted-foreground text-center text-sm mt-1">
            // {isLogin ? 'AUTHENTICATE' : 'CREATE_IDENTITY'}
          </p>
        </div>

        {/* Form container */}
        <div className="border border-t-0 border-primary p-6 card-hover">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-primary">
                  USERNAME_
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background border-primary/50 focus:border-primary text-primary placeholder:text-muted-foreground"
                  placeholder="neo"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary">
                EMAIL_
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-primary/50 focus:border-primary text-primary placeholder:text-muted-foreground"
                placeholder="operator@matrix.io"
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary">
                PASSWORD_
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-primary/50 focus:border-primary text-primary placeholder:text-muted-foreground"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 matrix-glow font-bold"
            >
              {isSubmitting ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'REGISTER'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {isLogin ? '// CREATE_NEW_IDENTITY' : '// EXISTING_USER_LOGIN'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-muted-foreground text-xs">
          <span className="terminal-cursor">SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}
