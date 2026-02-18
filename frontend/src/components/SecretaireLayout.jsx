/**
 * Secretaire Layout Component - Main layout for secretaires
 */
import { Outlet } from 'react-router-dom';
import SecretaireSidebar from './SecretaireSidebar';
import './Layout.css';

const SecretaireLayout = () => {
    return (
        <div className="layout">
            <SecretaireSidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default SecretaireLayout;

