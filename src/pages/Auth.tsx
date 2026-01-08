import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Sparkles, Heart, Target, Flame } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password needs at least 6 characters');

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
            title: 'Oops!',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back! 🎉',
            description: 'Great to see you again.',
          });
        }
      } else {
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Already registered',
              description: 'This email is already in use.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Registration failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome aboard! 🚀',
            description: 'Your journey to discipline starts now.',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 soft-bg relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="bubble-decoration bubble-1" />
      <div className="bubble-decoration bubble-2" />
      <div className="bubble-decoration bubble-3" />
      
      {/* Floating icons */}
      <div className="absolute top-20 left-[15%] animate-bounce-soft opacity-30">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <div className="absolute top-40 right-[20%] animate-bounce-soft opacity-30" style={{ animationDelay: '0.5s' }}>
        <Heart className="w-6 h-6 text-accent" />
      </div>
      <div className="absolute bottom-32 left-[25%] animate-bounce-soft opacity-30" style={{ animationDelay: '1s' }}>
        <Target className="w-7 h-7 text-primary" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-card p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 shadow-glow">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="heading-display text-3xl text-foreground">
              DisciplineOS
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Welcome back!' : 'Start your journey'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="soft-input"
                  placeholder="What should we call you?"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="soft-input"
                placeholder="hello@example.com"
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soft-input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full soft-btn h-12 text-base mt-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-primary font-semibold">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-primary font-semibold">Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer decoration */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Build better habits, one day at a time
          </p>
        </div>
      </div>
    </div>
  );
}