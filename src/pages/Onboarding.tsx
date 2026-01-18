import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ArrowRight, ArrowLeft, Target, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveResponses, completeOnboarding, skipOnboarding } = useOnboarding();
  
  const [step, setStep] = useState<'welcome' | 'survey' | 'complete' | 'motivation' | 'tutorial'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [motivationStep, setMotivationStep] = useState(0);

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

  const currentQ = surveyQuestions[currentQuestion];
  const hasAnswer = answers[currentQ?.id] !== undefined;

  return (
    <div className="min-h-screen water-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="glass-card rounded-3xl p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-primary" />
            </div>
            
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

            <Button onClick={() => setStep('motivation')} className="w-full">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Motivation Step */}
        {step === 'motivation' && (
          <div className="glass-card rounded-3xl p-8 text-center animate-fade-in-up">
            {motivationStep === 0 ? (
              <>
                <div className="text-6xl mb-6">📝</div>
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
                <div className="text-6xl mb-6">📊</div>
                <h2 className="heading-display text-xl text-foreground mb-4">
                  People who track their goals are 72% more likely to achieve them
                </h2>
                <p className="text-muted-foreground mb-8">
                  than those who don't
                </p>
                <Button onClick={handleComplete} className="w-full">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
