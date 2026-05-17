'use client';

import { useState } from 'react';
import styles from './page.module.css';

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

    <main className={styles.main}>

      <div className={styles.container}>

        {/* SEARCH */}

        <div className={styles.searchCard}>

          <div className={styles.header}>
            <h1 className={styles.title}>
              Work Permit Verification
            </h1>

            <span className={styles.subtitle}>
              Please provide the details below to verify a work permit
            </span>
          </div>

          <div className={styles.searchRow}>

            <div className={styles.field}>

              <label className={styles.label}>
                Work Permit Number
              </label>

              <input
                type="text"
                placeholder="WP00000000"
                value={wp}
                onChange={(e) => setWp(e.target.value)}
                className={styles.input}
              />

            </div>

            <div className={styles.field}>

              <label className={styles.label}>
                Name or Passport Number
              </label>

              <input
                type="text"
                placeholder="Passport or Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.input}
              />

            </div>

            <div className={styles.buttonWrap}>

              <label className={styles.label}>
                &nbsp;
              </label>

              <button
                onClick={fetchEmployee}
                className={styles.button}
                disabled={loading}
              >
                {loading ? 'Fetching...' : 'Fetch'}
              </button>

            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* RESULT */}

        {employee && (

          <div className={styles.resultCard}>

            <div className={styles.leftSection}>

              <img
                src={employee.image}
                alt="employee"
                className={styles.image}
              />

            </div>

            <div className={styles.middleSection}>

              <div className={styles.nameRow}>

                <h2 className={styles.employeeName}>
                  {employee.name}
                </h2>

                <span className={styles.verifiedBadge}>
                  ✓
                </span>

              </div>

              <div className={styles.infoGrid}>

                <span className={styles.infoPill}>{employee.employer}</span>
                <span className={styles.infoPill}>{employee.occupation}</span>
                <span className={styles.infoPill}>{employee.passport}</span>
                <span className={styles.infoPill}>{employee.wp}</span>

              </div>

              <div className={styles.detailRow}>
                <strong>Issued On:</strong> {employee.issuedOn}
              </div>

              <div className={styles.detailRow}>
                <strong>Valid Till:</strong>{' '}
                <span className={styles.validDate}>
                  {employee.validTill}
                </span>
              </div>

              <div className={styles.detailRow}>
                <strong>Work Site:</strong> {employee.workSite}
              </div>

            </div>

            <div className={styles.rightSection}>

              <div className={styles.statusBadge}>
                {employee.status}
              </div>

            </div>

          </div>

        )}

      </div>

    </main>

  );
}
