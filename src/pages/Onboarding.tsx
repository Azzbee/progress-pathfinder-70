import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Award, 
  Trophy, 
  MessageCircle,
  Check,
  Crown,
  Zap,
  Loader2,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AnimatedCharacter from '@/components/onboarding/AnimatedCharacter';
import XPExplainer from '@/components/onboarding/XPExplainer';
import GoalCreationGuide from '@/components/onboarding/GoalCreationGuide';

const surveyQuestions = [
  {
    id: 'happiness_score',
    question: 'How happy are you with where you are at right now?',
    type: 'scale',
    options: [1, 2, 3, 4, 5]
  },
  {
    id: 'doing_best',
    question: 'What would you say you are doing best at right now?',
    type: 'choice',
    options: ['physical', 'mental', 'academic', 'financial', 'social']
  },
  {
    id: 'doing_worst',
    question: 'What would you say you are doing worst at right now?',
    type: 'choice',
    options: ['physical', 'mental', 'academic', 'financial', 'social']
  },
  {
    id: 'fitness_score',
    question: 'How fit are you?',
    type: 'scale',
    options: [1, 2, 3, 4, 5]
  },
  {
    id: 'mental_wellbeing',
    question: 'How would you rank your mental wellbeing?',
    type: 'scale',
    options: [1, 2, 3, 4, 5]
  },
  {
    id: 'finances_score',
    question: 'How pleased are you with your finances?',
    type: 'scale',
    options: [1, 2, 3, 4, 5]
  },
  {
    id: 'academic_score',
    question: 'If you are a student, how are you doing academically?',
    type: 'scale',
    options: [1, 2, 3, 4, 5]
  },
  {
    id: 'social_score',
    question: 'How would you rank your social life?',
    type: 'scale',
    options: [1, 2, 3, 4, 5]
  },
  {
    id: 'biggest_challenge',
    question: 'What do you think is your biggest challenge?',
    type: 'choice',
    options: ['discipline', 'scheduling', 'laziness', 'goal_setting']
  }
];

const categoryLabels: Record<string, string> = {
  physical: 'Physical',
  mental: 'Mental',
  academic: 'Academic',
  financial: 'Financial',
  social: 'Social',
  discipline: 'Discipline',
  scheduling: 'Scheduling',
  laziness: 'Laziness',
  goal_setting: 'Goal Setting'
};

const tutorialSteps = [
  {
    icon: Target,
    title: 'Goals',
    description: 'Set and track your goals across different life categories. Break them into actionable tasks and watch your progress grow.'
  },
  {
    icon: Calendar,
    title: 'Schedule',
    description: 'Plan your day with events and tasks. See your daily schedule at a glance and never miss an important commitment.'
  },
  {
    icon: TrendingUp,
    title: 'Progress',
    description: 'Visualize your journey with charts and metrics. Track how you are improving over time across all areas.'
  },
  {
    icon: Award,
    title: 'Discipline',
    description: 'Get a score that reflects your consistency. See what you are excelling at and where you need focus.'
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Compete with others globally or create communities with friends to stay motivated together.'
  },
  {
    icon: MessageCircle,
    title: 'AI Coach',
    description: 'Get personalized guidance and advice from your AI coach to help you set better goals and stay on track.'
  }
];

const freeFeatures = [
  'Goal Setting',
  'Scheduling',
  'Goal Tracking',
  'Leaderboard',
  'Communities'
];

const proFeatures = [
  'Goal Setting',
  'Scheduling',
  'Goal Tracking',
  'Leaderboard',
  'Communities',
  'Progress Analytics',
  'Discipline Insights',
  'AI Coaching Assistant'
];

type OnboardingStep = 'welcome' | 'survey' | 'complete' | 'tutorial' | 'xp-system' | 'goal-setup' | 'motivation' | 'paywall';

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveResponses, completeOnboarding, skipOnboarding } = useOnboarding();
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [motivationStep, setMotivationStep] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleAnswer = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    saveResponses({ [questionId]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('complete');
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    navigate('/dashboard');
  };

  const handleSkip = async () => {
    await skipOnboarding();
    navigate('/dashboard');
  };

  const handlePlanSelection = async () => {
    if (!selectedPlan) return;

    if (selectedPlan === 'free') {
      // Free plan - just complete onboarding
      await handleComplete();
    } else {
      // Pro plan - create Stripe checkout session
      setIsProcessingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout');
        
        if (error) {
          throw error;
        }

        if (data?.url) {
          // Complete onboarding first, then redirect to Stripe
          await completeOnboarding();
          window.open(data.url, '_blank');
          navigate('/dashboard');
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        toast({
          title: 'Payment Error',
          description: 'Unable to start checkout. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setStep('xp-system');
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const currentQ = surveyQuestions[currentQuestion];
  const hasAnswer = answers[currentQ?.id] !== undefined;
  const currentTutorial = tutorialSteps[tutorialStep];

  return (
    <div className="min-h-screen water-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="glass-card rounded-3xl p-8 text-center animate-fade-in-up">
            <AnimatedCharacter variant="welcome" className="mx-auto mb-6" />
            
            <h1 className="heading-display text-2xl text-foreground mb-4">
              Welcome to DisciplineOS
            </h1>
            
            <p className="text-muted-foreground mb-2">
              To start, we are going to ask you a quick set of questions to personalize your self-improvement journey and maximize your betterment.
            </p>
            
            <p className="text-sm text-primary mb-8">
              Estimated time: 5 minutes
            </p>

            <div className="space-y-3">
              <Button onClick={() => setStep('survey')} className="w-full">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* Survey Step */}
        {step === 'survey' && currentQ && (
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} of {surveyQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / surveyQuestions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / surveyQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="heading-display text-xl text-foreground mb-6">
              {currentQ.question}
            </h2>

            {/* Scale Options */}
            {currentQ.type === 'scale' && (
              <div className="flex justify-between gap-2 mb-8">
                {currentQ.options.map((num) => (
                  <button
                    key={num}
                    onClick={() => handleAnswer(currentQ.id, num)}
                    className={cn(
                      'flex-1 py-4 rounded-2xl border-2 transition-all font-bold text-lg',
                      answers[currentQ.id] === num
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            {/* Choice Options */}
            {currentQ.type === 'choice' && (
              <div className="grid grid-cols-1 gap-2 mb-8">
                {currentQ.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQ.id, option)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left capitalize',
                      answers[currentQ.id] === option
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {categoryLabels[option] || option}
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {currentQuestion > 0 && (
                <Button variant="outline" onClick={prevQuestion}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button 
                onClick={nextQuestion} 
                disabled={!hasAnswer}
                className="flex-1"
              >
                {currentQuestion === surveyQuestions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="glass-card rounded-3xl p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="heading-display text-2xl text-foreground mb-4">
              You've made it this far!
            </h1>
            
            <p className="text-muted-foreground mb-8">
              Now that you know what you want to achieve, let's show you how to get there.
            </p>

            <Button onClick={() => setStep('tutorial')} className="w-full">
              Show Me How
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Tutorial Step */}
        {step === 'tutorial' && currentTutorial && (
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              {tutorialSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    idx === tutorialStep 
                      ? 'w-6 bg-primary' 
                      : idx < tutorialStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted/50'
                  )}
                />
              ))}
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <currentTutorial.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="heading-display text-xl text-foreground mb-3">
                {currentTutorial.title}
              </h2>
              
              <p className="text-muted-foreground mb-8">
                {currentTutorial.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {tutorialStep > 0 && (
                <Button variant="outline" onClick={prevTutorialStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button onClick={nextTutorialStep} className="flex-1">
                {tutorialStep === tutorialSteps.length - 1 ? 'Continue' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* XP System Explainer */}
        {step === 'xp-system' && (
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="heading-display text-xl text-foreground mb-2">
                Level Up Your Life
              </h2>
              <p className="text-sm text-muted-foreground">
                Earn XP and climb the ranks as you build discipline
              </p>
            </div>
            
            <XPExplainer />
            
            <Button onClick={() => setStep('goal-setup')} className="w-full mt-6">
              Set Your First Goal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Goal Creation Guide */}
        {step === 'goal-setup' && (
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            <GoalCreationGuide 
              onComplete={() => setStep('motivation')}
              onSkip={() => setStep('motivation')}
            />
          </div>
        )}

        {/* Motivation Step */}
        {step === 'motivation' && (
          <div className="glass-card rounded-3xl p-8 text-center animate-fade-in-up">
            {motivationStep === 0 ? (
              <>
                <AnimatedCharacter variant="thinking" className="mx-auto mb-6" />
                <h2 className="heading-display text-xl text-foreground mb-4">
                  People who write down goals are 42% more likely to achieve them
                </h2>
                <p className="text-muted-foreground mb-8">
                  than those who don't
                </p>
                <Button onClick={() => setMotivationStep(1)} className="w-full">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <AnimatedCharacter variant="celebrating" className="mx-auto mb-6" />
                <h2 className="heading-display text-xl text-foreground mb-4">
                  People who track their goals are 72% more likely to achieve them
                </h2>
                <p className="text-muted-foreground mb-8">
                  than those who don't
                </p>
                <Button onClick={() => setStep('paywall')} className="w-full">
                  Choose Your Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Paywall Step */}
        {step === 'paywall' && (
          <div className="animate-fade-in-up">
            <h2 className="heading-display text-2xl text-foreground text-center mb-6">
              Choose Your Plan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Free Trial */}
              <button
                onClick={() => setSelectedPlan('free')}
                disabled={isProcessingPayment}
                className={cn(
                  'glass-card rounded-3xl p-6 text-left transition-all border-2',
                  selectedPlan === 'free' 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-border'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-display font-semibold text-foreground">Free Trial</h3>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">3 Days</p>
                <p className="text-xs text-muted-foreground mb-4">No credit card required</p>
                
                <div className="space-y-2">
                  {freeFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <div className="w-4 h-4 border border-muted-foreground/50 rounded" />
                    <span className="text-muted-foreground line-through">Progress Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <div className="w-4 h-4 border border-muted-foreground/50 rounded" />
                    <span className="text-muted-foreground line-through">Discipline Insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <div className="w-4 h-4 border border-muted-foreground/50 rounded" />
                    <span className="text-muted-foreground line-through">AI Coaching Assistant</span>
                  </div>
                </div>
              </button>

              {/* Pro Version */}
              <button
                onClick={() => setSelectedPlan('pro')}
                disabled={isProcessingPayment}
                className={cn(
                  'glass-card rounded-3xl p-6 text-left transition-all border-2 relative overflow-hidden',
                  selectedPlan === 'pro' 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-border'
                )}
              >
                <div className="absolute top-3 right-3">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Popular
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">Pro Version</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <p className="text-2xl font-bold text-foreground">$2.99</p>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Full access to everything</p>
                
                <div className="space-y-2">
                  {proFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            </div>

            <Button 
              onClick={handlePlanSelection} 
              disabled={!selectedPlan || isProcessingPayment}
              className="w-full"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedPlan === 'pro' ? 'Start Pro Trial' : selectedPlan === 'free' ? 'Start Free Trial' : 'Select a Plan'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}