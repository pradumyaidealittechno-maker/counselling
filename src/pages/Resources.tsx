import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Plus, Search, Folder, Video, Book, Loader, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Resource {
    _id: string;
    title: string;
    description: string;
    type: 'Article' | 'Video' | 'PDF' | 'Link' | 'Document';
    category: string;
    createdAt: string;
    fileUrl?: string;
    externalUrl?: string;
    stats: {
        views: number;
        downloads: number;
    };
}

export default function Resources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [newResource, setNewResource] = useState({
        title: '',
        description: '',
        type: 'PDF' as const,
        category: 'Career Guidance',
        externalUrl: '',
        isPublic: true
    });

    const categories = ['All', 'Exam Prep', 'College Info', 'Career Guidance', 'Applications', 'Skill Development'];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const data = await api.resources.getAll();
            setResources(data);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            showToast.error('Could not load resources library');
        } finally {
            setLoading(false);
        }
    };

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.resources.create(newResource);
            showToast.success('Resource added successfully');
            setShowAddModal(false);
            fetchResources();
            setNewResource({
                title: '',
                description: '',
                type: 'PDF',
                category: 'Career Guidance',
                externalUrl: '',
                isPublic: true
            });
        } catch (error: any) {
            showToast.error(error.message || 'Failed to add resource');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to remove this resource?')) return;
        try {
            await api.resources.delete(id);
            showToast.success('Resource deleted');
            fetchResources();
        } catch (error) {
            showToast.error('Failed to delete resource');
        }
    };

    const handleTrack = async (id: string, action: 'view' | 'download') => {
        try {
            await api.resources.update(id + '/track', { action });
        } catch (e) {
            // Silently fail for tracking
        }
    };

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText size={20} className="text-red-500" />;
            case 'Video': return <Video size={20} className="text-blue-500" />;
            case 'Link': return <ExternalLink size={20} className="text-purple-500" />;
            case 'Article': return <Book size={20} className="text-green-500" />;
            default: return <FileText size={20} className="text-gray-500" />;
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Folder size={32} style={{ color: 'var(--primary-600)' }} />
                        Resources Library
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Share and manage study materials and guides for students
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} />
                    Add Resource
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginBottom: '2rem' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-full"
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>

                {/* Categories */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                border: selectedCategory === category ? '1px solid var(--primary-600)' : '1px solid var(--gray-200)',
                                background: selectedCategory === category ? 'var(--primary-50)' : 'white',
                                color: selectedCategory === category ? 'var(--primary-700)' : 'var(--gray-600)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin text-primary-600" size={48} />
                </div>
            ) : filteredResources.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredResources.map(resource => (
                        <div key={resource._id} className="card hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getIcon(resource.type)}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{resource.category}</span>
                                    <button onClick={(e) => handleDelete(resource._id, e)} className="text-gray-300 hover:text-error-600 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: 'auto' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                                    {resource.title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: '1.5', marginBottom: '1rem', height: '2.5rem', overflow: 'hidden' }}>
                                    {resource.description}
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                    {resource.stats.downloads} downloads • {resource.stats.views} views
                                </div>
                                <a
                                    href={resource.externalUrl || resource.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleTrack(resource._id, resource.type === 'Link' ? 'view' : 'download')}
                                    style={{ color: 'var(--primary-600)' }}
                                >
                                    {resource.type === 'Link' ? <ExternalLink size={18} /> : <Download size={18} />}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center p-12">
                    <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter.</p>
                </div>
            )}

            {/* Add Resource Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="card w-full max-w-lg shadow-2xl">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add New Resource</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddResource}>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Title *</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        required
                                        value={newResource.title}
                                        onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="label">Type</label>
                                        <select
                                            className="input w-full"
                                            value={newResource.type}
                                            onChange={e => setNewResource({ ...newResource, type: e.target.value as any })}
                                        >
                                            <option value="PDF">PDF Document</option>
                                            <option value="Video">Video Link</option>
                                            <option value="Link">External Website</option>
                                            <option value="Document">Generic File</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Category</label>
                                        <select
                                            className="input w-full"
                                            value={newResource.category}
                                            onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                                        >
                                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">URL (External or File Link) *</label>
                                    <input
                                        type="url"
                                        className="input w-full"
                                        required
                                        placeholder="https://..."
                                        value={newResource.externalUrl}
                                        onChange={e => setNewResource({ ...newResource, externalUrl: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Description *</label>
                                    <textarea
                                        className="input w-full"
                                        rows={3}
                                        required
                                        value={newResource.description}
                                        onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost" disabled={submitting}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <Loader className="animate-spin" size={18} /> : 'Save Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
