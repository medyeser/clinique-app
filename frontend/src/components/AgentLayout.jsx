/**
 * Agent Layout Component - Main layout for agents d'acceuil
 */
import { Outlet } from 'react-router-dom';
import AgentSidebar from './AgentSidebar';
import './Layout.css';

const AgentLayout = () => {
    return (
        <div className="layout">
            <AgentSidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AgentLayout;