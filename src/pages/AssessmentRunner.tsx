import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
}

const MOCK_QUESTIONS: Question[] = [
    {
        id: 1,
        text: "You enjoy solving complex mathematical puzzles more than reading literature.",
        options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
        correctAnswer: -1 // Personality question, no correct answer
    },
    {
        id: 2,
        text: "If a car travels 60km in 1.5 hours, what is its average speed?",
        options: ["30 km/h", "40 km/h", "45 km/h", "60 km/h"],
        correctAnswer: 1
    },
    {
        id: 3,
        text: "Which programming language is known as the language of the web?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correctAnswer: 2
    },
    {
        id: 4,
        text: "You prefer working in a team rather than working alone.",
        options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
        correctAnswer: -1
    },
    {
        id: 5,
        text: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
        correctAnswer: 1
    }
];

export default function AssessmentRunner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isSubmitted) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [MOCK_QUESTIONS[currentQuestion].id]: optionIndex
        }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    if (isSubmitted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fdfbf7 0%, #fff 100%)',
                padding: '2rem'
            }}>
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center',
                    background: 'white',
                    padding: '3rem',
                    borderRadius: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--success-100)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--success-600)'
                    }}>
                        <Award size={40} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                        Assessment Completed!
                    </h2>
                    <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', fontSize: '1.125rem' }}>
                        Great job! Your responses have been recorded. Our AI is analyzing your performance.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/dashboard/assessments')}
                            className="btn btn-primary"
                        >
                            Back to Assessments
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/reports')}
                            className="btn btn-outline"
                        >
                            View Report
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Stream Selector Test #{id}</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Section 1 of 1</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--orange-50)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'var(--orange-700)', fontWeight: 600 }}>
                        <Clock size={18} />
                        {formatTime(timeLeft)}
                    </div>
                    <button onClick={handleSubmit} className="btn btn-primary btn-sm">Submit Test</button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

                {/* Progress Bar */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <span>Question {currentQuestion + 1} of {MOCK_QUESTIONS.length}</span>
                        <span>{Math.round(((currentQuestion + 1) / MOCK_QUESTIONS.length) * 100)}% Completed</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${((currentQuestion + 1) / MOCK_QUESTIONS.length) * 100}%`, height: '100%', background: 'var(--primary-600)', transition: 'width 0.3s ease' }} />
                    </div>
                </div>

                {/* Question Card */}
                <div style={{ background: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '2rem', lineHeight: '1.4' }}>
                        {MOCK_QUESTIONS[currentQuestion].text}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {MOCK_QUESTIONS[currentQuestion].options.map((option, index) => (
                            <label
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: answers[MOCK_QUESTIONS[currentQuestion].id] === index ? '2px solid var(--primary-600)' : '2px solid var(--gray-200)',
                                    background: answers[MOCK_QUESTIONS[currentQuestion].id] === index ? 'var(--primary-50)' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: answers[MOCK_QUESTIONS[currentQuestion].id] === index ? '6px solid var(--primary-600)' : '2px solid var(--gray-300)',
                                    marginRight: '1rem',
                                    flexShrink: 0
                                }} />
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion}`}
                                    checked={answers[MOCK_QUESTIONS[currentQuestion].id] === index}
                                    onChange={() => handleAnswer(index)}
                                    style={{ display: 'none' }}
                                />
                                <span style={{ fontSize: '1.125rem', color: 'var(--gray-800)' }}>{option}</span>
                            </label>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                        <button
                            className="btn btn-outline"
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            style={{ paddingLeft: '1.5rem', paddingRight: '2rem' }}
                        >
                            <ChevronLeft size={20} style={{ marginRight: '0.5rem' }} /> Previous
                        </button>

                        {currentQuestion === MOCK_QUESTIONS.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                style={{ paddingLeft: '2rem', paddingRight: '1.5rem' }}
                            >
                                Finish Assessment <CheckCircle size={20} style={{ marginLeft: '0.5rem' }} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                style={{ paddingLeft: '2rem', paddingRight: '1.5rem' }}
                            >
                                Next Question <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
