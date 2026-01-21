-- Create challenges table for rival system
CREATE TABLE public.challenges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    challenger_id UUID NOT NULL,
    challenged_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    start_date DATE,
    end_date DATE,
    challenger_score NUMERIC DEFAULT 0,
    challenged_score NUMERIC DEFAULT 0,
    winner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for challenges
CREATE POLICY "Users can view challenges they are part of" 
ON public.challenges 
FOR SELECT 
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Participants can update their challenges" 
ON public.challenges 
FOR UPDATE 
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Challenger can delete pending challenges" 
ON public.challenges 
FOR DELETE 
USING (auth.uid() = challenger_id AND status = 'pending');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();