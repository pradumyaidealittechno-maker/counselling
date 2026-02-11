import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, Award, Loader } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Question {
    text: string;
    options: string[];
    correctAnswer: number;
}

export default function AssessmentRunner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchAssessment();
        }
    }, [id]);

    const fetchAssessment = async () => {
        try {
            // In a real app, you'd have a getById for assessments
            // For now, we'll fetch all and filter or assume there's an endpoint
            const res = await fetch(`/api/assessments/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();

            setAssessment(data);
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
            } else {
                // Fallback to mock if none assigned
                setQuestions([
                    { text: "How would you describe your interest in mathematics?", options: ["Extremely High", "High", "Moderate", "Low", "None"], correctAnswer: -1 },
                    { text: "Do you enjoy working with people or data?", options: ["Strictly People", "Mainly People", "Both Equally", "Mainly Data", "Strictly Data"], correctAnswer: -1 }
                ]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch assessment:', error);
            showToast.error('Could not load assessment');
            navigate('/dashboard/assessments');
        }
    };

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted && !loading) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isSubmitted) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted, loading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        try {
            const payloads = {
                questionResponses: Object.entries(answers).map(([qIdx, ansIdx]) => ({
                    questionText: questions[parseInt(qIdx)].text,
                    selectedOption: questions[parseInt(qIdx)].options[ansIdx],
                    isCorrect: ansIdx === questions[parseInt(qIdx)].correctAnswer
                })),
                score: Object.entries(answers).filter(([qIdx, ansIdx]) => ansIdx === questions[parseInt(qIdx)].correctAnswer).length,
                maxScore: questions.length
            };

            await api.assessments.submit(id!, payloads);
            setIsSubmitted(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (error) {
            showToast.error('Failed to submit assessment');
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-primary-600" size={48} /></div>;
    }

    if (isSubmitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '2rem' }}>
                <div className="card text-center p-12 max-w-lg w-full">
                    <div className="w-20 h-20 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-6"><Award size={40} /></div>
                    <h2 className="text-3xl font-bold mb-4">Assessment Completed!</h2>
                    <p className="text-gray-600 mb-8">Well done! Your counsellor will review the AI analysis shortly.</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => navigate('/dashboard/assessments')} className="btn btn-primary">Back to Hub</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column' }}>
            <header className="bg-white border-b p-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold">{assessment?.title}</h1>
                    <p className="text-sm text-gray-500">Class {assessment?.studentId?.currentGrade || '10th'}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg text-orange-700 font-bold">
                        <Clock size={18} /> {formatTime(timeLeft)}
                    </div>
                    <button onClick={handleSubmit} className="btn btn-primary btn-sm">Submit</button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                        <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
                    </div>
                </div>

                <div className="card p-12 shadow-xl">
                    <h2 className="text-2xl font-medium mb-8 leading-tight">{questions[currentQuestion].text}</h2>
                    <div className="space-y-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <label key={index} className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${answers[currentQuestion] === index ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${answers[currentQuestion] === index ? 'border-primary-600' : 'border-gray-300'}`}>
                                    {answers[currentQuestion] === index && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                                </div>
                                <input type="radio" name="option" checked={answers[currentQuestion] === index} onChange={() => handleAnswer(index)} className="hidden" />
                                <span className="text-lg text-gray-800">{option}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                        <button className="btn btn-ghost" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(prev => prev - 1)}><ChevronLeft size={20} className="mr-2" /> Previous</button>
                        {currentQuestion === questions.length - 1 ? (
                            <button className="btn btn-primary" onClick={handleSubmit}>Finish <CheckCircle size={20} className="ml-2" /></button>
                        ) : (
                            <button className="btn btn-primary" onClick={() => setCurrentQuestion(prev => prev + 1)}>Next <ChevronRight size={20} className="ml-2" /></button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
