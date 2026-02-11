import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Award, Loader } from 'lucide-react';
import api from '../services/api';

export default function Analytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.counsellingDashboard.getStats();
                setData(res);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Students',
            value: data?.stats?.totalStudents || 0,
            change: '+5%',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            title: 'Monthly Sessions',
            value: data?.stats?.totalSessions || 0,
            change: '+12%',
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Upcoming',
            value: data?.stats?.upcomingSessions || 0,
            change: 'Next 7 days',
            icon: Award,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            title: 'Engagement',
            value: `${data?.stats?.engagementRate || 0}%`,
            change: '+2%',
            icon: TrendingUp,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
    ];

    const maxSession = data?.sessionsByMonth?.length > 0
        ? Math.max(...data.sessionsByMonth.map((d: any) => d.count))
        : 10;

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BarChart3 size={32} className="text-primary-600" />
                    Counselling Analytics
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Real-time student progress and session engagement metrics.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card hover:shadow-md transition-shadow">
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
                            {stat.change}
                        </span>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>

                {/* Sessions Chart */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sessions Trend (Last 6 Months)</h3>
                    {data?.sessionsByMonth?.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '250px', gap: '1.5rem', padding: '1rem' }}>
                            {data.sessionsByMonth.map((item: any, index: number) => (
                                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(to top, var(--primary-600), var(--primary-400))',
                                            borderRadius: '6px 6px 0 0',
                                            height: `${(item.count / (maxSession || 1)) * 100}%`,
                                            minHeight: item.count > 0 ? '4px' : '0',
                                            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600 }}>{item.month}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                            No session data available for this period.
                        </div>
                    )}
                </div>

                {/* Grade Distribution */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Student Distribution (by Grade)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {data?.gradeBreakdown?.length > 0 ? (
                            data.gradeBreakdown.map((item: any, index: number) => {
                                const percentage = Math.round((item.count / data.stats.totalStudents) * 100);
                                const colors = ['var(--blue-500)', 'var(--purple-500)', 'var(--orange-500)', 'var(--pink-500)', 'var(--teal-500)'];
                                const color = colors[index % colors.length];

                                return (
                                    <div key={index}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                            <span style={{ fontWeight: 500 }}>{item.grade} Grade</span>
                                            <span style={{ fontWeight: 600 }}>{item.count} students ({percentage}%)</span>
                                        </div>
                                        <div style={{ width: '100%', background: 'var(--gray-100)', borderRadius: '1rem', height: '10px' }}>
                                            <div style={{ width: `${percentage}%`, background: color, height: '100%', borderRadius: '1rem', transition: 'width 1s ease-in-out' }} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                                No student data available.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
