-- Create events table (separate from goals for scheduling)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category_id UUID REFERENCES public.goal_categories(id) ON DELETE SET NULL,
  recurrence_type TEXT DEFAULT 'one_time' CHECK (recurrence_type IN ('one_time', 'daily', 'weekly')),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create onboarding_responses table
CREATE TABLE public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  happiness_score INTEGER CHECK (happiness_score >= 1 AND happiness_score <= 5),
  doing_best TEXT CHECK (doing_best IN ('physical', 'mental', 'academic', 'financial', 'social')),
  doing_worst TEXT CHECK (doing_worst IN ('physical', 'mental', 'academic', 'financial', 'social')),
  fitness_score INTEGER CHECK (fitness_score >= 1 AND fitness_score <= 5),
  mental_wellbeing INTEGER CHECK (mental_wellbeing >= 1 AND mental_wellbeing <= 5),
  finances_score INTEGER CHECK (finances_score >= 1 AND finances_score <= 5),
  academic_score INTEGER CHECK (academic_score >= 1 AND academic_score <= 5),
  social_score INTEGER CHECK (social_score >= 1 AND social_score <= 5),
  biggest_challenge TEXT CHECK (biggest_challenge IN ('discipline', 'scheduling', 'laziness', 'goal_setting')),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on onboarding_responses
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_responses
CREATE POLICY "Users can view own onboarding" ON public.onboarding_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own onboarding" ON public.onboarding_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON public.onboarding_responses FOR UPDATE USING (auth.uid() = user_id);

-- Create ai_chat_messages table
CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on ai_chat_messages
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_chat_messages
CREATE POLICY "Users can view own messages" ON public.ai_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.ai_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.ai_chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  sound_enabled BOOLEAN DEFAULT true,
  animation_intensity TEXT DEFAULT 'normal' CHECK (animation_intensity IN ('off', 'reduced', 'normal', 'high')),
  ambient_audio_enabled BOOLEAN DEFAULT false,
  ambient_audio_volume DECIMAL DEFAULT 0.3 CHECK (ambient_audio_volume >= 0 AND ambient_audio_volume <= 1),
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert preset goal categories (Physical, Mental, Academic, Financial, Social)
INSERT INTO public.goal_categories (name, color, is_preset, user_id) VALUES
  ('Physical', '#22c55e', true, NULL),
  ('Mental', '#8b5cf6', true, NULL),
  ('Academic', '#3b82f6', true, NULL),
  ('Financial', '#eab308', true, NULL),
  ('Social', '#ec4899', true, NULL)
ON CONFLICT DO NOTHING;