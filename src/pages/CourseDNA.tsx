import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dna, Shield, Loader, Plus, Sparkles, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

interface DNATrait {
    id: string;
    name: string;
    description: string;
    importance: ImportanceLevel;
    signals: string[];
}

interface CourseDNAData {
    _id: string;
    title: string;
    category: string;
    description: string;
    courseDNA?: {
        academicDNA: DNATrait[];
        skillDNA: DNATrait[];
        careerDNA: DNATrait[];
        personalityDNA: DNATrait[];
    };
    createdAt: string;
    updatedAt: string;
}

export default function CourseDNA() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseDNAData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingTrait, setEditingTrait] = useState<string | null>(null);
    const [editedTraits, setEditedTraits] = useState<Record<string, DNATrait>>({});

    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            const data = await api.courses.getById(courseId!);
            setCourse(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to load course:', err);
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDNA = async () => {
        if (!course?._id) return;
        try {
            setGenerating(true);
            const result = await api.courses.generateDNA(course._id);
            setCourse(prev => prev ? { ...prev, courseDNA: result.courseDNA } : null);
            showToast.success('Course DNA generated successfully!');
        } catch (err: any) {
            console.error('Failed to generate DNA:', err);
            setError('Failed to generate Course DNA');
            showToast.error('AI generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateTrait = (dimension: string, traitId: string, field: keyof DNATrait, value: string) => {
        const key = `${dimension}-${traitId}`;
        const currentTraits = course?.courseDNA?.[dimension as keyof typeof course.courseDNA] || [];
        const sourceTrait = (currentTraits as DNATrait[]).find(t => t.id === traitId);

        if (sourceTrait) {
            const currentTrait = editedTraits[key] || sourceTrait;
            setEditedTraits({
                ...editedTraits,
                [key]: { ...currentTrait, [field]: value }
            });
        }
    };

    const handleSaveDNA = async () => {
        if (!course?._id) return;
        try {
            setLoading(true);

            const updatedCourseDNA = { ...course.courseDNA };
            Object.entries(editedTraits).forEach(([key, trait]) => {
                const [dimension, traitId] = key.split('-');
                const dimensionKey = dimension as keyof typeof updatedCourseDNA;
                if (updatedCourseDNA[dimensionKey]) {
                    const index = (updatedCourseDNA[dimensionKey] as DNATrait[]).findIndex(t => t.id === traitId);
                    if (index !== -1) {
                        (updatedCourseDNA[dimensionKey] as DNATrait[])[index] = trait;
                    }
                }
            });

            await api.courses.update(course._id, {
                courseDNA: updatedCourseDNA
            });

            showToast.success('Course DNA saved successfully!');
            navigate(`/dashboard/courses/${course._id}`);
        } catch (err: any) {
            console.error('Failed to save Course DNA:', err);
            showToast.error('Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrait = (dimension: string, traitId: string) => {
        if (!course?.courseDNA) return;

        const updatedCourseDNA = { ...course.courseDNA } as any;
        updatedCourseDNA[dimension] = updatedCourseDNA[dimension].filter((t: DNATrait) => t.id !== traitId);

        setCourse(prev => prev ? { ...prev, courseDNA: updatedCourseDNA } : null);

        const key = `${dimension}-${traitId}`;
        if (editedTraits[key]) {
            const newEdited = { ...editedTraits };
            delete newEdited[key];
            setEditedTraits(newEdited);
        }
    };

    const handleAddTrait = (dimension: string) => {
        if (!course?.courseDNA) return;

        const newId = `new-${Date.now()}`;
        const newTrait: DNATrait = {
            id: newId,
            name: 'New Trait',
            description: '',
            importance: 'medium',
            signals: []
        };

        const updatedCourseDNA = { ...course.courseDNA } as any;
        updatedCourseDNA[dimension] = [newTrait, ...updatedCourseDNA[dimension]];

        setCourse(prev => prev ? { ...prev, courseDNA: updatedCourseDNA } : null);
        setEditingTrait(`${dimension}-${newId}`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <Loader size={40} className="animate-spin" color="var(--primary-600)" />
                <p style={{ marginTop: '1.2rem', color: 'var(--gray-500)' }}>Syncing with AI...</p>
            </div>
        );
    }

    if (!course) return <div style={{ padding: '2rem' }}>Course not found</div>;

    const courseDNA = course.courseDNA || { academicDNA: [], skillDNA: [], careerDNA: [], personalityDNA: [] };
    const hasDNA = Object.values(courseDNA).some(arr => arr.length > 0);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Dna size={20} color="var(--primary-600)" />
                        <span style={{ color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Counselling AI Training</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)' }}>{course.title}</h1>
                    <p style={{ color: 'var(--gray-500)' }}>{course.category} • Review and refine the AI profile for this course</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard/courses')}>Edit Later</button>
                    {hasDNA && (
                        <button className="btn btn-primary" onClick={handleSaveDNA}>
                            <Shield size={18} /> Approve & Finalize
                        </button>
                    )}
                </div>
            </div>

            {!hasDNA ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', border: '2px dashed var(--gray-200)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Sparkles size={40} color="var(--primary-600)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Generate Course DNA</h2>
                    <p style={{ color: 'var(--gray-600)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                        Our AI will analyze the course description and resources to create a multi-dimensional student alignment profile.
                    </p>
                    {error && (
                        <div style={{ color: '#EF4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <Shield size={16} /> {error}
                        </div>
                    )}
                    <button className="btn btn-primary btn-lg" onClick={handleGenerateDNA} disabled={generating}>
                        {generating ? <><Loader size={20} className="animate-spin" /> Training AI...</> : <><Sparkles size={20} /> Generate AI Profile</>}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <DNASection title="Academic DNA" dimension="academicDNA" traits={courseDNA.academicDNA} color="#6366F1" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onDelete={handleDeleteTrait} onAdd={handleAddTrait} editedTraits={editedTraits} />
                        <DNASection title="Skill DNA" dimension="skillDNA" traits={courseDNA.skillDNA} color="#10B981" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onDelete={handleDeleteTrait} onAdd={handleAddTrait} editedTraits={editedTraits} />
                        <DNASection title="Career DNA" dimension="careerDNA" traits={courseDNA.careerDNA} color="#F59E0B" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onDelete={handleDeleteTrait} onAdd={handleAddTrait} editedTraits={editedTraits} />
                        <DNASection title="Personality DNA" dimension="personalityDNA" traits={courseDNA.personalityDNA} color="#3B82F6" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onDelete={handleDeleteTrait} onAdd={handleAddTrait} editedTraits={editedTraits} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>AI Context</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
                                This DNA profile powers the AI Assistant when recommending this course to students.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
                                <Shield size={16} color="var(--primary-600)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Human Verified Profile</span>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
                            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleGenerateDNA} disabled={generating}>
                                <Sparkles size={16} /> Regenerate DNA
                            </button>
                            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#EF4444' }} onClick={() => navigate('/dashboard/courses')}>
                                <Trash2 size={16} /> Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    );
}

function DNASection({ title, dimension, traits, color, editingTrait, setEditingTrait, onUpdate, onDelete, onAdd, editedTraits }: any) {
    return (
        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>({traits.length})</span>
                </div>
                <button onClick={() => onAdd(dimension)} className="btn btn-ghost btn-sm"><Plus size={16} /> Add</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {traits.map((trait: DNATrait) => {
                    const isEditing = editingTrait === `${dimension}-${trait.id}`;
                    const currentTrait = editedTraits[`${dimension}-${trait.id}`] || trait;

                    return (
                        <div
                            key={trait.id}
                            style={{
                                padding: '1rem',
                                background: isEditing ? 'rgba(99, 102, 241, 0.02)' : 'var(--gray-50)',
                                border: isEditing ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                                borderRadius: '0.75rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => !isEditing && setEditingTrait(`${dimension}-${trait.id}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                {isEditing ? (
                                    <input
                                        className="input"
                                        value={currentTrait.name}
                                        onChange={(e) => onUpdate(dimension, trait.id, 'name', e.target.value)}
                                        style={{ background: 'white' }}
                                    />
                                ) : (
                                    <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{currentTrait.name}</span>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select
                                        value={currentTrait.importance}
                                        onChange={(e) => onUpdate(dimension, trait.id, 'importance', e.target.value)}
                                        className="input"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', width: 'auto' }}
                                    >
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(dimension, trait.id); }} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}><X size={16} /></button>
                                </div>
                            </div>
                            {isEditing ? (
                                <textarea
                                    className="input"
                                    value={currentTrait.description}
                                    onChange={(e) => onUpdate(dimension, trait.id, 'description', e.target.value)}
                                    style={{ background: 'white', marginTop: '0.5rem' }}
                                    rows={3}
                                />
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>{currentTrait.description}</p>
                            )}
                            {isEditing && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setEditingTrait(null); }}>Done</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
