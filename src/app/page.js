'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

export default function Home() {

  const [wp, setWp] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function verify(wpVal, searchVal) {
    const w = (wpVal || wp).trim();
    const s = (searchVal || search).trim();

    if (!w || !s) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');
    setEmployee(null);

    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wp: w, search: s })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setEmployee(data.employee);
      }
    } catch {
      setError('Connection failed. Please try again.');
    }

    setLoading(false);
  }

  const handleImageSelected = useCallback(async (file) => {
    if (!file) return;

    setError('');
    setEmployee(null);
    setScanning(true);
    setScanProgress(0);
    setScanned(false);

    try {
      const Tesseract = await import('tesseract.js');

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setScanProgress(Math.round(info.progress * 100));
          }
        }
      });

      const text = result.data.text;

      const wpMatch = text.match(/WP\s*[-:]?\s*(\d{5,})/i)
        || text.match(/(WP\d{5,})/i);
      let extractedWp = '';
      if (wpMatch) {
        extractedWp = wpMatch[1].startsWith('WP') ? wpMatch[1] : 'WP' + wpMatch[1];
      }

      const passportMatch = text.match(/(?:passport|pp)\s*(?:no\.?|number|#)?\s*[-:]?\s*([A-Z]\d{6,9})/i)
        || text.match(/\b([A-Z]\d{6,9})\b/);
      const extractedPassport = passportMatch ? passportMatch[1] : '';

      let extractedName = '';
      if (!extractedPassport) {
        const nameMatch = text.match(/(?:name|employee)\s*[-:]?\s*([A-Za-z\s]{3,40})/i);
        if (nameMatch) extractedName = nameMatch[1].trim();
      }

      if (extractedWp) setWp(extractedWp);
      const searchVal = extractedPassport || extractedName;
      if (searchVal) setSearch(searchVal);

      if (extractedWp && searchVal) {
        setScanning(false);
        setScanProgress(0);
        setScanned(true);
        await verify(extractedWp, searchVal);
        return;
      }

      if (!extractedWp && !searchVal) {
        setError('Couldn\'t read the document. Please enter details manually.');
      } else if (!extractedWp) {
        setError('Couldn\'t find a work permit number. Please enter it manually.');
      } else {
        setError('Couldn\'t find a name or passport. Please enter it manually.');
      }
    } catch {
      setError('Scan failed. Please try again or enter details manually.');
    }

    setScanning(false);
    setScanProgress(0);
    setScanned(true);
  }, []);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) handleImageSelected(file);
    e.target.value = '';
  }

  const statusClass = employee?.isValid === true
    ? styles.statusBarValid
    : employee?.isValid === false
      ? styles.statusBarExpired
      : styles.statusBarUnknown;

  const validClass = employee?.isValid === true
    ? styles.detailValueValid
    : employee?.isValid === false
      ? styles.detailValueExpired
      : styles.detailValue;

  return (
    <div className={styles.app}>

      <nav className={styles.navBar}>
        <div className={styles.navTitle}>Verify</div>
        <div className={styles.navSubtitle}>Work Permit Verification</div>
      </nav>

      <main className={styles.content}>

        {/* Scan + Form Card */}
        <div className={styles.sectionLabel}>Lookup</div>
        <div className={styles.card}>

          <div className={styles.scanRow}>
            <button className={styles.scanBtn} onClick={() => cameraInputRef.current?.click()}>
              <span className={styles.scanIcon}>📷</span>
              Camera
            </button>
            <button className={styles.scanBtn} onClick={() => fileInputRef.current?.click()}>
              <span className={styles.scanIcon}>🖼️</span>
              Photo Library
            </button>
          </div>

          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
            onChange={handleFileChange} className={styles.scanHidden} />
          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={handleFileChange} className={styles.scanHidden} />

          {scanned && (
            <div className={styles.scannedBadge}>
              <span>✓</span> Document scanned
            </div>
          )}

          <div className={styles.formRow}>
            <span className={styles.formLabel}>Permit</span>
            <input
              type="text"
              placeholder="WP00000000"
              value={wp}
              onChange={(e) => setWp(e.target.value)}
              className={styles.formInput}
              autoComplete="off"
            />
          </div>

          <div className={styles.formRow}>
            <span className={styles.formLabel}>Name</span>
            <input
              type="text"
              placeholder="Name or Passport"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.formInput}
              autoComplete="off"
            />
          </div>

        </div>

        <button
          onClick={() => verify()}
          className={styles.button}
          disabled={loading}
        >
          {loading && <span className={styles.spinner} />}
          {loading ? 'Verifying…' : 'Verify'}
        </button>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Result */}
        {employee && (
          <>
            <div className={styles.sectionLabel}>Result</div>
            <div className={styles.resultCard}>

              <div className={`${styles.statusBar} ${statusClass}`}>
                <span className={styles.statusText}>{employee.status}</span>
                <span className={styles.statusDot} />
              </div>

              <div className={styles.profileHeader}>
                <img src={employee.image} alt={employee.name} className={styles.profileImage} />
                <div className={styles.profileInfo}>
                  <h2 className={styles.profileName}>
                    {employee.name}
                    <span className={styles.verifiedIcon}>✓</span>
                  </h2>
                  <div className={styles.profileOccupation}>{employee.occupation}</div>
                  <div className={styles.profileEmployer}>{employee.employer}</div>
                </div>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Passport</span>
                <span className={styles.detailValue}>{employee.passport}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Work Permit</span>
                <span className={styles.detailValue}>{employee.wp}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Issued</span>
                <span className={styles.detailValue}>{employee.issuedOn}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Valid Till</span>
                <span className={validClass}>{employee.validTill}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Work Site</span>
                <span className={styles.detailValue}>
                  {employee.workSite}
                  {employee.workSiteCode && (
                    <span className={styles.siteCode}>{employee.workSiteCode}</span>
                  )}
                </span>
              </div>

            </div>
          </>
        )}

      </main>

      {/* OCR Overlay */}
      {scanning && (
        <div className={styles.ocrOverlay}>
          <div className={styles.ocrModal}>
            <div className={styles.ocrSpinner} />
            <div className={styles.ocrTitle}>Scanning</div>
            <div className={styles.ocrSubtitle}>Reading document…</div>
            <div className={styles.ocrProgress}>
              <div className={styles.ocrProgressBar} style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
