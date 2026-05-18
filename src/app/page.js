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

  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  async function verify(w, s) {
    w = (w || wp).trim();
    s = (s || search).trim();
    if (!w || !s) { setError('Please fill in both fields'); return; }

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
      if (!data.success) setError(data.message);
      else setEmployee(data.employee);
    } catch {
      setError('Connection failed. Please try again.');
    }
    setLoading(false);
  }

  const handleImage = useCallback(async (file) => {
    if (!file) return;
    setError(''); setEmployee(null);
    setScanning(true); setScanProgress(0); setScanned(false);

    try {
      const Tesseract = await import('tesseract.js');
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (i) => { if (i.status === 'recognizing text') setScanProgress(Math.round(i.progress * 100)); }
      });

      const text = result.data.text;
      const wpM = text.match(/WP\s*[-:]?\s*(\d{5,})/i) || text.match(/(WP\d{5,})/i);
      let eWp = '';
      if (wpM) eWp = wpM[1].startsWith('WP') ? wpM[1] : 'WP' + wpM[1];

      const ppM = text.match(/(?:passport|pp)\s*(?:no\.?|number|#)?\s*[-:]?\s*([A-Z]\d{6,9})/i) || text.match(/\b([A-Z]\d{6,9})\b/);
      const ePp = ppM ? ppM[1] : '';
      let eName = '';
      if (!ePp) { const nm = text.match(/(?:name|employee)\s*[-:]?\s*([A-Za-z\s]{3,40})/i); if (nm) eName = nm[1].trim(); }

      if (eWp) setWp(eWp);
      const sv = ePp || eName;
      if (sv) setSearch(sv);

      if (eWp && sv) { setScanning(false); setScanProgress(0); setScanned(true); await verify(eWp, sv); return; }
      if (!eWp && !sv) setError('Couldn\'t read the document. Enter details manually.');
      else if (!eWp) setError('Couldn\'t find a permit number. Enter it manually.');
      else setError('Couldn\'t find a name or passport. Enter it manually.');
    } catch { setError('Scan failed. Please try again.'); }

    setScanning(false); setScanProgress(0); setScanned(true);
  }, []);

  function onFile(e) { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ''; }

  const statusCls = employee?.isValid === true ? styles.statusValid
    : employee?.isValid === false ? styles.statusExpired : styles.statusOther;

  const validCls = employee?.isValid === true ? styles.rowGreen
    : employee?.isValid === false ? styles.rowRed : styles.rowValue;

  return (
    <div className={styles.app}>

      <nav className={styles.navBar}>
        <img src="/icon-192.png" alt="" className={styles.navLogo} />
        <div className={styles.navText}>
          <span className={styles.navTitle}>XPAT Verify</span>
          <span className={styles.navSub}>Work Permit Verification</span>
        </div>
      </nav>

      <main className={styles.content}>

        <div className={styles.sectionLabel}>Scan or Enter</div>

        <div className={styles.card}>
          <div className={styles.scanRow}>
            <button className={styles.scanBtn} onClick={() => cameraRef.current?.click()}>
              <svg className={styles.scanIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Camera
            </button>
            <button className={styles.scanBtn} onClick={() => fileRef.current?.click()}>
              <svg className={styles.scanIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Photos
            </button>
          </div>

          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            onChange={onFile} className={styles.scanHidden} />
          <input ref={fileRef} type="file" accept="image/*"
            onChange={onFile} className={styles.scanHidden} />

          {scanned && (
            <div className={styles.scannedBadge}>
              <span>✓</span> Document scanned
            </div>
          )}

          <div className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Work Permit Number</span>
            <input type="text" placeholder="WP00000000" value={wp}
              onChange={(e) => setWp(e.target.value)}
              className={styles.fieldInput} autoComplete="off" />
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Name or Passport</span>
            <input type="text" placeholder="Ahmed / A1234567" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.fieldInput} autoComplete="off" />
          </div>

          <button onClick={() => verify()} className={styles.verifyBtn} disabled={loading}>
            {loading && <span className={styles.spinner} />}
            {loading ? 'Verifying…' : 'Verify Permit'}
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorDot}>!</span>
            <span className={styles.errorMsg}>{error}</span>
          </div>
        )}

        {employee && (
          <>
            <div className={styles.sectionLabel}>Result</div>
            <div className={styles.result}>

              <div className={styles.profile}>
                <img src={employee.image} alt={employee.name} className={styles.profileImg} />
                <div className={styles.profileBody}>
                  <div className={styles.profileTop}>
                    <h2 className={styles.profileName}>
                      {employee.name}<span className={styles.verified}>✓</span>
                    </h2>
                    <span className={`${styles.statusPill} ${statusCls}`}>
                      <span className={styles.statusDot} />
                      {employee.status}
                    </span>
                  </div>
                  <div className={styles.profileRole}>{employee.occupation}</div>
                  <div className={styles.profileCompany}>{employee.employer}</div>
                </div>
              </div>

              <div className={styles.details}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Passport</span>
                  <span className={styles.rowValue}>{employee.passport}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Work Permit</span>
                  <span className={styles.rowValue}>{employee.wp}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Issued</span>
                  <span className={styles.rowValue}>{employee.issuedOn}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Valid Till</span>
                  <span className={validCls}>{employee.validTill}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Work Site</span>
                  <span className={styles.rowValue}>
                    {employee.workSite}
                    {employee.workSiteCode && <span className={styles.siteCode}>{employee.workSiteCode}</span>}
                  </span>
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      {scanning && (
        <div className={styles.ocrOverlay}>
          <div className={styles.ocrModal}>
            <div className={styles.ocrSpinner} />
            <div className={styles.ocrTitle}>Scanning</div>
            <div className={styles.ocrSub}>Reading document…</div>
            <div className={styles.ocrBar}>
              <div className={styles.ocrFill} style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
