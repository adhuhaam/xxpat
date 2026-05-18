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
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function fetchEmployee(wpVal, searchVal) {
    const wpNum = wpVal || wp;
    const searchStr = searchVal || search;

    if (!wpNum.trim() || !searchStr.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');
    setEmployee(null);

    try {
      const response = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wp: wpNum, search: searchStr })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setEmployee(data.employee);
      }
    } catch (err) {
      setError('Failed to fetch employee. Please try again.');
    }

    setLoading(false);
  }

  const handleImageSelected = useCallback(async (file) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    setError('');
    setEmployee(null);
    setScanning(true);
    setScanProgress(0);

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
        extractedWp = wpMatch[1].startsWith('WP')
          ? wpMatch[1]
          : 'WP' + wpMatch[1];
      }

      const passportMatch = text.match(/(?:passport|pp)\s*(?:no\.?|number|#)?\s*[-:]?\s*([A-Z]\d{6,9})/i)
        || text.match(/\b([A-Z]\d{6,9})\b/);
      const extractedPassport = passportMatch ? passportMatch[1] : '';

      let extractedName = '';
      if (!extractedPassport) {
        const nameMatch = text.match(/(?:name|employee)\s*[-:]?\s*([A-Za-z\s]{3,40})/i);
        if (nameMatch) {
          extractedName = nameMatch[1].trim();
        }
      }

      if (extractedWp) {
        setWp(extractedWp);
      }

      const searchVal = extractedPassport || extractedName;
      if (searchVal) {
        setSearch(searchVal);
      }

      if (extractedWp && searchVal) {
        await fetchEmployeeDirect(extractedWp, searchVal);
      } else if (!extractedWp && !searchVal) {
        setError('Could not find work permit or passport details in the image. Please enter manually.');
      } else if (!extractedWp) {
        setError('Found some text but couldn\'t detect a work permit number (WP...). Please enter it manually.');
      } else {
        setError('Found work permit but couldn\'t detect a name or passport number. Please enter it manually.');
      }

    } catch (err) {
      setError('Failed to scan image. Please try again or enter details manually.');
    }

    setScanning(false);
    setScanProgress(0);
  }, []);

  async function fetchEmployeeDirect(wpVal, searchVal) {
    setLoading(true);
    setError('');
    setEmployee(null);

    try {
      const response = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wp: wpVal, search: searchVal })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setEmployee(data.employee);
      }
    } catch (err) {
      setError('Failed to fetch employee. Please try again.');
    }

    setLoading(false);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) handleImageSelected(file);
    e.target.value = '';
  }

  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  const isActive = employee?.status?.toLowerCase().includes('active');

  return (
    <div className={styles.app}>

      <header className={styles.topBar}>
        <div className={styles.appIcon}>🔍</div>
        <div className={styles.topBarText}>
          <span className={styles.topBarTitle}>XPAT Verify</span>
          <span className={styles.topBarSub}>Work Permit Verification</span>
        </div>
      </header>

      <main className={styles.content}>

        {/* OCR Scan Card */}
        <div className={styles.scanCard}>
          <span className={styles.scanLabel}>Scan Document</span>
          <div className={styles.scanActions}>
            <button
              className={styles.scanBtn}
              onClick={() => cameraInputRef.current?.click()}
            >
              <span className={styles.scanBtnIcon}>📷</span>
              Take Photo
            </button>
            <button
              className={styles.scanBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.scanBtnIcon}>📁</span>
              Upload
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className={styles.scanHidden}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.scanHidden}
          />

          {preview && (
            <div className={styles.previewWrap}>
              <img src={preview} alt="Scanned document" className={styles.previewImage} />
              <span className={styles.previewInfo}>Document uploaded</span>
              <button className={styles.previewClear} onClick={clearPreview}>✕</button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span>or enter manually</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Manual Search Card */}
        <div className={styles.searchCard}>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Work Permit Number</label>
              <input
                type="text"
                placeholder="e.g. WP00012345"
                value={wp}
                onChange={(e) => setWp(e.target.value)}
                className={styles.input}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Name or Passport</label>
              <input
                type="text"
                placeholder="e.g. Ahmed / A1234567"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.input}
                autoComplete="off"
              />
            </div>
          </div>

          <button
            onClick={() => fetchEmployee()}
            className={styles.button}
            disabled={loading}
          >
            {loading && <span className={styles.spinner} />}
            {loading ? 'Verifying...' : 'Verify Work Permit'}
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Result */}
        {employee && (
          <div className={styles.resultCard}>

            <div className={`${styles.statusBanner} ${isActive ? styles.statusActive : styles.statusOther}`}>
              <span className={styles.statusText}>{employee.status}</span>
              <span className={styles.statusDot} />
            </div>

            <div className={styles.profileSection}>
              <img
                src={employee.image}
                alt={employee.name}
                className={styles.profileImage}
              />
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>
                  {employee.name}
                  <span className={styles.verifiedBadge}>✓</span>
                </h2>
                <div className={styles.profileOccupation}>{employee.occupation}</div>
                <div className={styles.profileEmployer}>{employee.employer}</div>
              </div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Passport No.</span>
                <span className={styles.detailValue}>{employee.passport}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Work Permit</span>
                <span className={styles.detailValue}>{employee.wp}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Issued On</span>
                <span className={styles.detailValue}>{employee.issuedOn}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Valid Till</span>
                <span className={styles.detailValueGreen}>{employee.validTill}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Work Site</span>
                <span className={styles.detailValue}>{employee.workSite}</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* OCR Processing Overlay */}
      {scanning && (
        <div className={styles.ocrOverlay}>
          <div className={styles.ocrModal}>
            <div className={styles.ocrSpinner} />
            <div className={styles.ocrTitle}>Scanning Document</div>
            <div className={styles.ocrSubtitle}>Extracting text from image...</div>
            <div className={styles.ocrProgress}>
              <div className={styles.ocrProgressBar} style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
