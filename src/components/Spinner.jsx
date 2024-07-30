import { useState, useEffect } from 'react'

const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    zIndex: 1,
};

const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
};

const Spinner = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div
            style={{ ...containerStyle, transform: `translate(${position.x}px, ${position.y}px)` }}
        >
            <div style={spinnerStyle}></div>
        </div>
    );
};

export default Spinner;

// Add keyframes directly in the CSS-in-JS
const styleSheet = document.styleSheets[0];
const keyframes =
    `@keyframes spin {
        to { transform: rotate(360deg); }
    }`;

styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
