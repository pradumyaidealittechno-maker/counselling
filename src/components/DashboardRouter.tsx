import { useEffect, useState } from 'react';
import Dashboard from '../pages/Dashboard';
import CounsellingDashboard from '../pages/CounsellingDashboard';
import StudentDashboard from '../pages/StudentDashboard';

export default function DashboardRouter() {
    const [selectedModule, setSelectedModule] = useState<'recruitment' | 'counselling'>(
        (localStorage.getItem('selected_module') as 'recruitment' | 'counselling') || 'recruitment'
    );
    const userRole = localStorage.getItem('user_role') || 'staff';

    useEffect(() => {
        // Listen for module change events
        const handleModuleChange = () => {
            const newModule = (localStorage.getItem('selected_module') as 'recruitment' | 'counselling') || 'recruitment';
            setSelectedModule(newModule);
        };

        window.addEventListener('moduleChanged', handleModuleChange);

        return () => {
            window.removeEventListener('moduleChanged', handleModuleChange);
        };
    }, []);

    // Render appropriate dashboard based on role and module
    if (userRole === 'student') {
        return <StudentDashboard />;
    }

    if (selectedModule === 'counselling') {
        return <CounsellingDashboard />;
    }

    return <Dashboard />;
}
