import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

// --- Type Definitions (Kept as is) ---
type AudioAnalysis = {
  wpm?: number;
  filler_words?: string[];
  filler_word_count?: number;
  pauses?: {
    count: number;
    total_duration: number;
    frequency: number;
  };
  tone_analysis?: {
    emotion: string;
    confidence: number;
  };
  sentiment?: {
    score: number;
    label: string;
  };
};

type RoundData = {
  roundNumber: number;
  transcript: string;
  audioAnalysis?: AudioAnalysis;
  feedback: {
    suggestions: string[];
    feedback: string;
    score: number;
    content_analysis?: Record<string, any>;
    delivery_analysis?: Record<string, any>;
  };
  timestamp: string;
};

type FeedbackData = {
  mode: 'debate' | 'speech';
  title: string;
  type: string;
  currentRound: number;
  totalRounds: number;
  rounds: RoundData[];
};

// --- UI Component Replacements (Styled with Tailwind CSS) ---

// Simple Button Replacement
const Button = ({ children, onClick, variant = 'default', size = 'lg', className = '', disabled = false }: any) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-150 flex items-center justify-center';
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-base';

  let variantClasses = '';
  switch (variant) {
    case 'outline':
      variantClasses = 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent';
      break;
    case 'destructive':
      variantClasses = 'bg-red-600 text-white hover:bg-red-700 shadow-md';
      break;
    default: // default is the blue primary button for this page
      variantClasses = 'bg-blue-600 text-white hover:bg-blue-700 shadow-md';
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Simple Card Replacements
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: any) => (
  <div className={`p-4 border-b border-gray-100 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: any) => (
  <h2 className={`text-xl font-bold text-gray-800 ${className}`}>{children}</h2>
);
const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);
const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// --- Helper Components ---

const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
    <p className="mt-4 text-gray-600">Loading analysis...</p>
  </div>
);

const NotFoundCard = ({ navigate }: { navigate: any }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <Card className="w-full max-w-lg p-6 text-center">
      <CardTitle className="text-3xl mb-2">No Feedback Available</CardTitle>
      <CardDescription className="text-base mb-6">
        No feedback data was found. Please complete a recording first.
      </CardDescription>
      <Button
        onClick={() => navigate('/')}
        className="gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
    </Card>
  </div>
);

// --- Main Component ---

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.feedback) {
      const data = location.state.feedback as FeedbackData;
      setFeedbackData(data);
      // Default to the last recorded round for immediate viewing
      setCurrentRoundIndex(data.rounds.length - 1); 
      setIsLoading(false);
    } else {
      // Handle missing data scenario
      setIsLoading(false);
    }
  }, [location.state]);

  const currentRound = feedbackData?.rounds[currentRoundIndex];
  const isDebateMode = feedbackData?.mode === 'debate';

  // Memoized calculations
  const averageScore = feedbackData?.rounds.length > 0
    ? Math.round(feedbackData.rounds.reduce((sum, round) => sum + round.feedback.score, 0) / feedbackData.rounds.length)
    : 0;
  
  // Format WPM and other metrics
  const formatMetric = useCallback((value: number | undefined, unit: string = '') => {
    if (value === undefined || value === null) return 'N/A';
    // Rounds to one decimal place
    return `${Math.round(value * 10) / 10}${unit}`;
  }, []);

  // --- Render Sections ---

  const renderRoundNavigation = () => (
    <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-xl shadow-inner border border-gray-200">
      <Button
        variant="outline"
        size="sm"
        disabled={currentRoundIndex === 0}
        onClick={() => setCurrentRoundIndex(prev => Math.max(0, prev - 1))}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Prev. Round
      </Button>

      <div className="text-base font-semibold text-gray-700">
        Round {currentRoundIndex + 1} of {feedbackData?.rounds.length}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentRoundIndex >= (feedbackData?.rounds.length || 0) - 1}
        onClick={() => setCurrentRoundIndex(prev => Math.min((feedbackData?.rounds.length || 0) - 1, prev + 1))}
        className="gap-2"
      >
        Next Round
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </Button>
    </div>
  );

  const renderSpeechMetrics = () => {
    if (!currentRound?.audioAnalysis) return null;

    const { wpm, filler_word_count, pauses, tone_analysis } = currentRound.audioAnalysis;

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Delivery Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Speaking Rate</span>
            <span className="text-2xl font-bold text-gray-800">{formatMetric(wpm, ' WPM')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Filler Words</span>
            <span className="text-2xl font-bold text-gray-800">{filler_word_count || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Pauses (Count/Min)</span>
            <span className="text-2xl font-bold text-gray-800">
              {pauses?.count || 0} ({formatMetric(pauses?.frequency)})
            </span>
          </div>
          {tone_analysis && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Predicted Tone</span>
              <span className="text-xl font-bold capitalize text-gray-800">
                {tone_analysis.emotion}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  ({Math.round(tone_analysis.confidence * 100)}%)
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // --- Conditional Rendering ---
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!feedbackData || !currentRound) {
    return <NotFoundCard navigate={navigate} />;
  }


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Overall Score */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-500">
          <div>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="gap-2 mb-2 px-0 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {isDebateMode ? 'Debate Final Report' : 'Speech Analysis'}
            </h1>
            <p className="text-lg text-gray-500">{feedbackData.title} ({feedbackData.type})</p>
          </div>
          
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Overall Score</p>
              <p className="text-3xl font-bold text-green-600">{averageScore}<span className="text-xl">/100</span></p>
            </div>
            <div className="h-16 w-px bg-gray-200 hidden sm:block"></div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Round Score</p>
              <p className="text-3xl font-bold text-blue-600">{currentRound.feedback.score}<span className="text-xl">/100</span></p>
            </div>
          </div>
        </div>
        
        {/* Round Navigation */}
        {feedbackData.rounds.length > 1 && renderRoundNavigation()}
        
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column (Transcript & Metrics) - Takes 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Transcript Section */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-xl text-blue-700">Your Transcript</CardTitle>
                <CardDescription>
                  Recorded at: {new Date(currentRound.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-inner h-64 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-base text-gray-700 leading-relaxed">
                    {currentRound.transcript || 'No transcript available'}
                  </p>
                  {currentRound.audioAnalysis?.filler_words && currentRound.audioAnalysis.filler_words.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-red-500 font-medium">
                      Filler Words Found: {currentRound.audioAnalysis.filler_words.join(', ')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Speech Metrics */}
            {renderSpeechMetrics()}

          </div>

          {/* Right Column (Feedback & Suggestions) - Takes 1/3 width */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Overall Feedback Card */}
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  AI Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-800">Overall Assessment</h3>
                  <p className="text-sm text-gray-600">{currentRound.feedback.feedback}</p>
                </div>
                
                {/* Content Analysis */}
                {currentRound.feedback.content_analysis && Object.keys(currentRound.feedback.content_analysis).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Content Breakdown</h3>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg border">
                      {Object.entries(currentRound.feedback.content_analysis).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-500 capitalize">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                          </span>
                          <span className="font-bold text-gray-800">
                            {typeof value === 'number' ? `${value}/100` : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggestions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-yellow-700 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Actionable Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {currentRound.feedback.suggestions?.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3 border-l-4 border-yellow-400 pl-3">
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  )) || (
                    <p className="text-sm text-gray-500">No specific suggestions available.</p>
                  )}
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
        
        {/* Footer Action Buttons */}
        <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="text-gray-700 hover:bg-gray-100"
            >
              Start New Session
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Record Again
            </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
