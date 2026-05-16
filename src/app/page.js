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
    <main style={{minHeight:'100vh',background:'#f3f4f6',padding:'40px'}}>

      <div style={{maxWidth:'700px',margin:'0 auto'}}>

        <div style={{background:'#fff',padding:'30px',borderRadius:'20px',boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>

          <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'20px'}}>
            XPAT Employee Fetch
          </h1>

          <input
            type="text"
            placeholder="WP Number"
            value={wp}
            onChange={(e) => setWp(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Passport Number or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={fetchEmployee}
            style={buttonStyle}
          >
            {loading ? 'Fetching...' : 'Fetch Employee'}
          </button>

        </div>

        {error && (
          <div style={{background:'#fee2e2',padding:'20px',marginTop:'20px',borderRadius:'12px',color:'#dc2626'}}>
            {error}
          </div>
        )}

        {employee && (
          <div style={{background:'#fff',padding:'30px',marginTop:'20px',borderRadius:'20px',boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>

            <img
              src={employee.image}
              alt="employee"
              style={{width:'120px',height:'120px',borderRadius:'12px',objectFit:'cover',marginBottom:'20px'}}
            />

            <h2 style={{fontSize:'28px',fontWeight:'bold',marginBottom:'20px'}}>
              {employee.name}
            </h2>

            <p><strong>Employer:</strong> {employee.employer}</p>
            <p><strong>Passport:</strong> {employee.passport}</p>
            <p><strong>WP Number:</strong> {employee.wp}</p>
            <p><strong>Status:</strong> {employee.status}</p>
            <p><strong>Valid Till:</strong> {employee.validTill}</p>

          </div>
        )}

      </div>

    </main>
  );
}

const inputStyle = {
  width:'100%',
  padding:'15px',
  marginBottom:'15px',
  border:'1px solid #ddd',
  borderRadius:'12px',
  fontSize:'16px'
};

const buttonStyle = {
  width:'100%',
  padding:'15px',
  background:'#2563eb',
  color:'#fff',
  border:'none',
  borderRadius:'12px',
  fontSize:'16px',
  cursor:'pointer'
};
