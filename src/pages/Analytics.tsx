import { BarChart3, TrendingUp, Users, Calendar, Award } from 'lucide-react';

export default function Analytics() {

    const stats = [
        { title: 'Total Sessions', value: '145', change: '+12%', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Active Students', value: '45', change: '+5%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Avg Score', value: '88%', change: '+2%', icon: Award, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Engagement', value: '92%', change: '+8%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const sessionsByMonth = [
        { month: 'Jan', count: 20 },
        { month: 'Feb', count: 35 },
        { month: 'Mar', count: 25 },
        { month: 'Apr', count: 40 },
        { month: 'May', count: 30 },
        { month: 'Jun', count: 45 },
    ];

    const maxSession = Math.max(...sessionsByMonth.map(d => d.count));

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BarChart3 size={32} className="text-primary-600" />
                    Analytics Dashboard
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Performance metrics and student engagement insights.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>{stat.title}</p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)' }}>{stat.value}</h3>
                            </div>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem' }} className={stat.bg}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--success-600)', background: 'var(--success-50)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontWeight: 500 }}>
                            {stat.change} from last month
                        </span>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repea(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Sessions Chart */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sessions Overview</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '1rem' }}>
                        {sessionsByMonth.map((item, index) => (
                            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        background: 'var(--primary-500)',
                                        borderRadius: '4px 4px 0 0',
                                        height: `${(item.count / maxSession) * 100}%`,
                                        transition: 'height 0.5s ease-out'
                                    }}
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: 500 }}>{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Breakdown */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Student Interests</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Engineering</span>
                                <span style={{ fontWeight: 600 }}>45%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--gray-100)', borderRadius: '1rem', height: '8px' }}>
                                <div style={{ width: '45%', background: 'var(--blue-500)', height: '100%', borderRadius: '1rem' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Medical</span>
                                <span style={{ fontWeight: 600 }}>25%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--gray-100)', borderRadius: '1rem', height: '8px' }}>
                                <div style={{ width: '25%', background: 'var(--purple-500)', height: '100%', borderRadius: '1rem' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Management</span>
                                <span style={{ fontWeight: 600 }}>20%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--gray-100)', borderRadius: '1rem', height: '8px' }}>
                                <div style={{ width: '20%', background: 'var(--orange-500)', height: '100%', borderRadius: '1rem' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Arts & Design</span>
                                <span style={{ fontWeight: 600 }}>10%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--gray-100)', borderRadius: '1rem', height: '8px' }}>
                                <div style={{ width: '10%', background: 'var(--pink-500)', height: '100%', borderRadius: '1rem' }} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
