/**
 * Loading Component - Loading spinner
 */

const Loading = ({ text = 'Chargement...' }) => {
    return (
        <div className="loading-container">
            <div style={{ textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>{text}</p>
            </div>
        </div>
    );
};

export default Loading;
