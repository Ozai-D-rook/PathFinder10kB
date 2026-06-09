import { useState } from "react";
import { useSubmitAssessment } from "@workspace/api-client-react";
import { ProtectedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "subjects",
    category: "Favourite Subjects",
    question: "Which school subject do you enjoy the most?",
    options: [
      { value: "mathematics", label: "Mathematics" },
      { value: "biology", label: "Biology" },
      { value: "physics", label: "Physics / Chemistry" },
      { value: "english", label: "English / Literature" },
      { value: "economics", label: "Economics / Commerce" },
      { value: "geography", label: "Geography / Agriculture" },
    ],
  },
  {
    id: "interests",
    category: "Interest Areas",
    question: "What kind of activities do you enjoy most outside of class?",
    options: [
      { value: "technology", label: "Computers and technology" },
      { value: "health", label: "Helping sick or injured people" },
      { value: "business", label: "Buying, selling, or managing money" },
      { value: "building", label: "Building or fixing things" },
      { value: "writing", label: "Writing, drawing, or creative work" },
      { value: "farming", label: "Farming or nature activities" },
    ],
  },
  {
    id: "skills",
    category: "Skills",
    question: "Which skill do you feel most naturally gifted at?",
    options: [
      { value: "numbers", label: "Working with numbers and data" },
      { value: "communication", label: "Talking and persuading people" },
      { value: "hands", label: "Working with my hands" },
      { value: "research", label: "Reading and finding information" },
      { value: "leadership", label: "Leading or organising groups" },
      { value: "creativity", label: "Creating art, music, or stories" },
    ],
  },
  {
    id: "personality",
    category: "Personality Traits",
    question: "How would your friends best describe you?",
    options: [
      { value: "caring", label: "Caring and empathetic" },
      { value: "analytical", label: "Logical and analytical" },
      { value: "creative", label: "Creative and imaginative" },
      { value: "ambitious", label: "Ambitious and business-minded" },
      { value: "curious", label: "Curious and always learning" },
      { value: "social", label: "Social and community-focused" },
    ],
  },
  {
    id: "workStyle",
    category: "Preferred Work Style",
    question: "Which work environment appeals to you most?",
    options: [
      { value: "office", label: "Office / indoor desk work" },
      { value: "field", label: "Outdoor / field work" },
      { value: "hospital", label: "Hospital or clinic" },
      { value: "lab", label: "Laboratory or research setting" },
      { value: "classroom", label: "Classroom or teaching environment" },
      { value: "business", label: "Business or entrepreneurial setting" },
    ],
  },
  {
    id: "academicStrengths",
    category: "Academic Strengths",
    question: "In which area do you score highest academically?",
    options: [
      { value: "sciences", label: "Science subjects (Biology, Chemistry, Physics)" },
      { value: "maths", label: "Mathematics and Further Maths" },
      { value: "arts", label: "Arts subjects (Literature, History, Government)" },
      { value: "commercial", label: "Commercial subjects (Economics, Accounting)" },
      { value: "technical", label: "Technical / Vocational subjects" },
      { value: "languages", label: "Languages (English, French)" },
    ],
  },
  {
    id: "problemSolving",
    category: "Problem-Solving",
    question: "When you face a difficult problem, what do you typically do?",
    options: [
      { value: "research", label: "Research and gather information first" },
      { value: "experiment", label: "Try different approaches and experiment" },
      { value: "discuss", label: "Discuss with others to find a solution" },
      { value: "calculate", label: "Use calculations or logical steps" },
      { value: "creative", label: "Think creatively and find unique solutions" },
      { value: "practical", label: "Take practical hands-on action" },
    ],
  },
  {
    id: "creativity",
    category: "Creativity Level",
    question: "How creative would you say you are?",
    options: [
      { value: "very_creative", label: "Very creative — I love art, design, and new ideas" },
      { value: "moderately", label: "Moderately creative — I can think outside the box when needed" },
      { value: "practical", label: "Practical — I prefer proven methods over experimentation" },
      { value: "technical", label: "Technical creative — I innovate through engineering or technology" },
      { value: "literary", label: "Literary — I express myself through writing" },
      { value: "not_sure", label: "I'm not sure yet" },
    ],
  },
  {
    id: "communication",
    category: "Communication Confidence",
    question: "How confident are you speaking in front of people?",
    options: [
      { value: "very_confident", label: "Very confident — I love public speaking" },
      { value: "confident", label: "Confident — I can do it without much stress" },
      { value: "moderate", label: "Moderate — I manage but prefer small groups" },
      { value: "prefer_writing", label: "I prefer written communication over speaking" },
      { value: "one_on_one", label: "I'm better one-on-one than in groups" },
      { value: "working_on_it", label: "I'm still working on my confidence" },
    ],
  },
  {
    id: "technologyInterest",
    category: "Technology Interest",
    question: "How interested are you in technology and computers?",
    options: [
      { value: "very_high", label: "Very high — I want to build software or systems" },
      { value: "high", label: "High — I enjoy using technology to solve problems" },
      { value: "moderate", label: "Moderate — I use technology but it's not my passion" },
      { value: "low", label: "Low — I prefer non-tech fields" },
      { value: "medical_tech", label: "Interested in medical technology specifically" },
      { value: "agricultural_tech", label: "Interested in agricultural technology" },
    ],
  },
  {
    id: "businessInterest",
    category: "Business Interest",
    question: "How interested are you in business and entrepreneurship?",
    options: [
      { value: "very_high", label: "Very high — I want to own my own business" },
      { value: "high", label: "High — I enjoy commerce and economics" },
      { value: "moderate", label: "Moderate — I might work in a business role" },
      { value: "low", label: "Low — I prefer non-business fields" },
      { value: "social_enterprise", label: "I'd like to run a social enterprise that helps people" },
      { value: "agriculture_business", label: "I'm interested in agribusiness" },
    ],
  },
  {
    id: "engineeringInterest",
    category: "Engineering Interest",
    question: "How interested are you in engineering and construction?",
    options: [
      { value: "very_high", label: "Very high — I love building and designing things" },
      { value: "high", label: "High — I enjoy technical and mechanical work" },
      { value: "moderate", label: "Moderate — I find engineering interesting" },
      { value: "low", label: "Low — I prefer other fields" },
      { value: "software", label: "I'm more interested in software engineering" },
      { value: "civil", label: "Civil engineering — roads, buildings, infrastructure" },
    ],
  },
  {
    id: "healthInterest",
    category: "Health/Science Interest",
    question: "How interested are you in health and medical sciences?",
    options: [
      { value: "very_high", label: "Very high — I want to be a doctor or medical professional" },
      { value: "high", label: "High — I enjoy biology and health sciences" },
      { value: "moderate", label: "Moderate — I find healthcare important" },
      { value: "low", label: "Low — I prefer non-medical fields" },
      { value: "pharmacy", label: "I'm specifically interested in pharmacy" },
      { value: "nursing", label: "I'm interested in nursing or community health" },
    ],
  },
  {
    id: "socialInterest",
    category: "Social/Helping Interest",
    question: "How much do you enjoy helping and working with people in your community?",
    options: [
      { value: "very_high", label: "Very high — helping people is my biggest motivation" },
      { value: "high", label: "High — I enjoy community service and social work" },
      { value: "moderate", label: "Moderate — I care but it's not my primary focus" },
      { value: "low", label: "Low — I prefer working independently" },
      { value: "teaching", label: "I love helping people by teaching them" },
      { value: "policy", label: "I want to help through policy and governance" },
    ],
  },
];

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const submitAssessment = useSubmitAssessment();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep) / QUESTIONS.length) * 100;
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const selectedAnswer = answers[currentQuestion.id];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      toast({ title: "Please select an answer", description: "Choose an option before continuing.", variant: "destructive" });
      return;
    }
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSubmit = () => {
    submitAssessment.mutate(
      { data: { answers } },
      {
        onSuccess: (result) => {
          toast({ title: "Assessment Complete!", description: "Your career recommendation is ready." });
          setLocation(`/results/${result.recommendation.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Could not submit assessment. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <ProtectedLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-assessment-title">Career Assessment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Question {currentStep + 1} of {QUESTIONS.length}
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}% complete</p>
        </div>

        <Card data-testid="card-question">
          <CardHeader>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider" data-testid="text-category">
              {currentQuestion.category}
            </p>
            <CardTitle className="text-xl leading-snug" data-testid="text-question">
              {currentQuestion.question}
            </CardTitle>
            <CardDescription>Select the option that best describes you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  data-testid={`option-${option.value}`}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    selectedAnswer === option.value
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0 || submitAssessment.isPending}
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || submitAssessment.isPending}
            data-testid="button-next"
          >
            {submitAssessment.isPending
              ? "Generating your results..."
              : isLastStep
              ? "Get My Career Results"
              : "Next Question"}
          </Button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
