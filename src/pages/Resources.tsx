import { useState } from 'react';
import { FileText, Download, ExternalLink, Plus, Search, Folder, Video, Book } from 'lucide-react';

interface Resource {
    id: string;
    title: string;
    type: 'PDF' | 'Link' | 'Video' | 'Document';
    category: string;
    dateAdded: string;
    size?: string;
    downloads: number;
}

const MOCK_RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'SAT Preparation Guide 2026',
        type: 'PDF',
        category: 'Exam Prep',
        dateAdded: '2026-01-15',
        size: '2.4 MB',
        downloads: 45
    },
    {
        id: '2',
        title: 'Top Engineering Colleges in India',
        type: 'Document',
        category: 'College Info',
        dateAdded: '2026-02-01',
        size: '1.1 MB',
        downloads: 32
    },
    {
        id: '3',
        title: 'Career Options in Psychology (Video)',
        type: 'Video',
        category: 'Career Guidance',
        dateAdded: '2026-01-20',
        size: '150 MB',
        downloads: 18
    },
    {
        id: '4',
        title: 'Common Application Portal',
        type: 'Link',
        category: 'Applications',
        dateAdded: '2025-12-10',
        downloads: 120
    }
];

export default function Resources() {
    const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Exam Prep', 'College Info', 'Career Guidance', 'Applications'];

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
            default: return <Book size={20} className="text-gray-500" />;
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
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        className="input"
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredResources.map(resource => (
                    <div key={resource.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {getIcon(resource.type)}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                {resource.category}
                            </span>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem', lineHeight: '1.4' }}>
                                {resource.title}
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                Added on {new Date(resource.dateAdded).toLocaleDateString()}
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                {resource.size && <span>{resource.size} • </span>}
                                {resource.downloads} downloads
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--primary-600)' }}
                            >
                                {resource.type === 'Link' ? <ExternalLink size={16} /> : <Download size={16} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
