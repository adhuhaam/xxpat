'use client';

import { useState } from 'react';

export default function Home() {

  const [wp, setWp] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  async function fetchEmployee() {

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

        {/* SEARCH */}

        <div style={searchCard}>

          <div style={headerStyle}>
            <h1 style={titleStyle}>
              Work Permit Verification
            </h1>

            <span style={subTitleStyle}>
              please provide below details to verify work permit
            </span>
          </div>

          <div style={searchRow}>

            <div style={{flex:1}}>

              <label style={labelStyle}>
                Work Permit Number
              </label>

              <input
                type="text"
                placeholder="WP00000000"
                value={wp}
                onChange={(e) => setWp(e.target.value)}
                style={inputStyle}
              />

            </div>

            <div style={{flex:1}}>

              <label style={labelStyle}>
                Name or Passport Number
              </label>

              <input
                type="text"
                placeholder="Passport or Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />

            </div>

            <div>

              <label style={labelStyle}>
                Work Permit
              </label>

              <button
                onClick={fetchEmployee}
                style={buttonStyle}
              >
                {loading ? 'Fetching...' : 'Fetch'}
              </button>

            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {/* RESULT */}

        {employee && (

          <div style={resultCard}>

            <div style={leftSection}>

              <img
                src={employee.image}
                alt="employee"
                style={imageStyle}
              />

            </div>

            <div style={middleSection}>

              <div style={nameRow}>

                <h2 style={employeeName}>
                  {employee.name}
                </h2>

                <span style={verifiedBadge}>
                  ✓
                </span>

              </div>

              <div style={infoGrid}>

                <Info text={employee.employer} />
                <Info text={employee.occupation} />
                <Info text={employee.passport} />
                <Info text={employee.wp} />

              </div>

              <div style={detailRow}>
                <strong>Issued On:</strong> {employee.issuedOn}
              </div>

              <div style={detailRow}>
                <strong>Work Permit Valid till:</strong>{' '}
                <span style={{color:'#14b8a6'}}>
                  {employee.validTill}
                </span>
              </div>

              <div style={detailRow}>
                <strong>Work Site:</strong> {employee.workSite}
              </div>

            </div>

            <div style={rightSection}>

              <div style={statusBadge}>
                {employee.status}
              </div>

            </div>

          </div>

        )}

      </div>

    </main>

  );
}

function Info({ text }) {

  return (
    <div style={smallInfo}>
      {text}
    </div>
  );
}

/* STYLES */

const mainStyle = {
  minHeight:'100vh',
  background:'#f5f5f5',
  padding:'40px',
  fontFamily:'Arial'
};

const containerStyle = {
  maxWidth:'1400px',
  margin:'0 auto'
};

const searchCard = {
  background:'#fff',
  borderRadius:'12px',
  padding:'30px',
  boxShadow:'0 5px 20px rgba(0,0,0,0.08)',
  marginBottom:'25px'
};

const headerStyle = {
  marginBottom:'30px'
};

const titleStyle = {
  fontSize:'36px',
  marginBottom:'8px',
  color:'#444'
};

const subTitleStyle = {
  color:'#888',
  fontSize:'16px'
};

const searchRow = {
  display:'flex',
  gap:'20px',
  alignItems:'end',
  flexWrap:'wrap'
};

const labelStyle = {
  display:'block',
  marginBottom:'10px',
  fontWeight:'600',
  color:'#555'
};

const inputStyle = {
  width:'100%',
  padding:'16px',
  border:'1px solid #ddd',
  borderRadius:'10px',
  fontSize:'16px',
  minWidth:'300px'
};

const buttonStyle = {
  padding:'16px 40px',
  background:'#3b82f6',
  color:'#fff',
  border:'none',
  borderRadius:'10px',
  fontSize:'16px',
  cursor:'pointer'
};

const errorStyle = {
  background:'#fee2e2',
  color:'#dc2626',
  padding:'18px',
  borderRadius:'12px',
  marginBottom:'20px'
};

const resultCard = {
  background:'#fff',
  borderRadius:'14px',
  padding:'35px',
  display:'flex',
  gap:'30px',
  alignItems:'flex-start',
  boxShadow:'0 5px 20px rgba(0,0,0,0.08)',
  flexWrap:'wrap'
};

const leftSection = {
  flexShrink:0
};

const imageStyle = {
  width:'160px',
  borderRadius:'12px',
  objectFit:'cover'
};

const middleSection = {
  flex:1
};

const rightSection = {
  display:'flex',
  alignItems:'start'
};

const employeeName = {
  fontSize:'42px',
  fontWeight:'700',
  color:'#444'
};

const verifiedBadge = {
  width:'34px',
  height:'34px',
  borderRadius:'50%',
  background:'#14b8a6',
  color:'#fff',
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  fontWeight:'bold'
};

const nameRow = {
  display:'flex',
  alignItems:'center',
  gap:'12px',
  marginBottom:'20px'
};

const infoGrid = {
  display:'flex',
  flexWrap:'wrap',
  gap:'20px',
  marginBottom:'20px',
  color:'#666'
};

const smallInfo = {
  fontSize:'20px'
};

const detailRow = {
  marginBottom:'12px',
  fontSize:'20px',
  color:'#555'
};

const statusBadge = {
  background:'#dbeafe',
  color:'#2563eb',
  padding:'14px 22px',
  borderRadius:'10px',
  fontWeight:'700',
  fontSize:'16px'
};
