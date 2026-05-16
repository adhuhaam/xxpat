'use client';

import { useState } from 'react';

export default function Home() {

  const [wp, setWp] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  async function fetchEmployee() {

    if (!wp || !search) {
      setError('Please enter WP Number and Passport/Name');
      return;
    }

    setLoading(true);
    setError('');
    setEmployee(null);

    try {

      const response = await fetch('/api/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wp,
          search
        })
      });

      const data = await response.json();

      if (!data.success) {

        setError(data.message);

      } else {

        setEmployee(data.employee);

      }

    } catch (err) {

      setError('Failed to fetch employee');

    }

    setLoading(false);
  }

  return (

    <main style={mainStyle}>

      <div style={containerStyle}>

        {/* HEADER */}

        <div style={searchCard}>

          <div style={logoCircle}>
            XP
          </div>

          <h1 style={titleStyle}>
            XPAT Employee Fetch
          </h1>

          <p style={subtitleStyle}>
            Verify employee work permit details instantly
          </p>

          <input
            type="text"
            placeholder="WP Number (WP00000000)"
            value={wp}
            onChange={(e) => setWp(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Passport Number or Employee Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={fetchEmployee}
            style={buttonStyle}
          >
            {loading ? 'Fetching Employee...' : 'Fetch Employee'}
          </button>

        </div>

        {/* ERROR */}

        {error && (

          <div style={errorStyle}>
            {error}
          </div>

        )}

        {/* EMPLOYEE CARD */}

        {employee && (

          <div style={employeeCard}>

            {/* TOP */}

            <div style={topSection}>

              <img
                src={employee.image}
                alt="employee"
                style={profileImage}
              />

              <h2 style={employeeName}>
                {employee.name}
              </h2>

              <div style={statusBadge}>
                {employee.status}
              </div>

            </div>

            {/* DETAILS */}

            <div style={detailsSection}>

              <InfoRow
                label="Employer"
                value={employee.employer}
              />

              <InfoRow
                label="Passport"
                value={employee.passport}
              />

              <InfoRow
                label="Work Permit"
                value={employee.wp}
              />

              <InfoRow
                label="Valid Till"
                value={employee.validTill}
              />

            </div>

          </div>

        )}

      </div>

    </main>

  );
}

function InfoRow({ label, value }) {

  return (

    <div style={infoRow}>

      <div style={infoLabel}>
        {label}
      </div>

      <div style={infoValue}>
        {value || 'N/A'}
      </div>

    </div>

  );

}

/* STYLES */

const mainStyle = {
  minHeight: '100vh',
  background: '#eef2ff',
  padding: '40px 20px',
  fontFamily: 'Arial, sans-serif'
};

const containerStyle = {
  maxWidth: '750px',
  margin: '0 auto'
};

const searchCard = {
  background: '#fff',
  padding: '40px',
  borderRadius: '30px',
  boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
  marginBottom: '30px'
};

const logoCircle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg,#2563eb,#1e3a8a)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '20px'
};

const titleStyle = {
  fontSize: '40px',
  fontWeight: '800',
  marginBottom: '10px',
  color: '#111827'
};

const subtitleStyle = {
  color: '#6b7280',
  marginBottom: '30px',
  fontSize: '16px'
};

const inputStyle = {
  width: '100%',
  padding: '18px',
  marginBottom: '18px',
  border: '1px solid #d1d5db',
  borderRadius: '16px',
  fontSize: '16px',
  outline: 'none'
};

const buttonStyle = {
  width: '100%',
  padding: '18px',
  background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
  color: '#fff',
  border: 'none',
  borderRadius: '16px',
  fontSize: '17px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 10px 20px rgba(37,99,235,0.3)'
};

const errorStyle = {
  background: '#fee2e2',
  color: '#dc2626',
  padding: '18px',
  borderRadius: '16px',
  marginBottom: '25px',
  fontWeight: '600'
};

const employeeCard = {
  background: '#fff',
  borderRadius: '30px',
  overflow: 'hidden',
  boxShadow: '0 15px 40px rgba(0,0,0,0.08)'
};

const topSection = {
  background: 'linear-gradient(135deg,#2563eb,#1e40af)',
  padding: '50px 30px',
  textAlign: 'center',
  color: '#fff'
};

const profileImage = {
  width: '140px',
  height: '140px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '5px solid rgba(255,255,255,0.3)',
  marginBottom: '20px'
};

const employeeName = {
  fontSize: '36px',
  fontWeight: '800',
  marginBottom: '15px'
};

const statusBadge = {
  display: 'inline-block',
  background: 'rgba(255,255,255,0.15)',
  padding: '10px 22px',
  borderRadius: '999px',
  fontSize: '15px',
  fontWeight: '600'
};

const detailsSection = {
  padding: '35px'
};

const infoRow = {
  padding: '18px 0',
  borderBottom: '1px solid #f3f4f6'
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#2563eb',
  marginBottom: '6px',
  textTransform: 'uppercase'
};

const infoValue = {
  fontSize: '18px',
  color: '#111827',
  fontWeight: '500'
};
