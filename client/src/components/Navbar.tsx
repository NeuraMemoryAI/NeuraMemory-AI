import React from 'react';
import styles from './Navbar.module.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-actions']}>
        <span className={styles['navbar-logo']}>
          <span style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            <span style={{display: 'inline-flex', alignItems: 'center'}}>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{marginRight: 12}} xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="7" width="24" height="24" rx="6" fill="#18181b" stroke="#38bdf8" strokeWidth="2"/>
                <rect x="13" y="13" width="12" height="12" rx="3" fill="#a78bfa" stroke="#38bdf8" strokeWidth="1.5"/>
                <circle cx="13" cy="13" r="2" fill="#38bdf8"/>
                <circle cx="25" cy="13" r="2" fill="#38bdf8"/>
                <circle cx="13" cy="25" r="2" fill="#38bdf8"/>
                <circle cx="25" cy="25" r="2" fill="#38bdf8"/>
                <rect x="18" y="18" width="2" height="2" rx="1" fill="#fff"/>
                <path d="M19 7V11" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M19 27V31" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 19H11" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M27 19H31" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontWeight: 900,
                fontSize: '1.6rem',
                letterSpacing: '0.01em',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
              }}>
                <span style={{color: '#38bdf8'}}>Neura</span>
                <span style={{color: '#64748b', fontWeight: 900}}>Memory</span>
                <span style={{color: '#a78bfa', fontWeight: 900}}>AI</span>
              </span>
            </span>
            <span style={{
              fontSize: '0.78rem',
              color: '#cbd5e1',
              fontWeight: 500,
              letterSpacing: '0.09em',
              marginTop: 2,
              marginLeft: 2,
              textTransform: 'uppercase',
            }}>
              INTELLIGENT NEURAL SOLUTIONS
            </span>
          </span>
        </span>
      </div>
      <div className={styles['navbar-actions']}>
        <button
          className="text-sm font-medium text-gray-300 bg-transparent border-none cursor-pointer hover:text-blue-400 transition"
          onClick={() => navigate('/manage-memories')}
        >
          Manage memories
        </button>
        {/* Login and Signup links removed as requested */}
        <div className={styles['navbar-avatar']}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" />
          </svg>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
