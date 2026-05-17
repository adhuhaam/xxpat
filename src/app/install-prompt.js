'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './install-prompt.module.css';

const DISMISSED_KEY = 'xpat_install_dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (isStandalone) return;

    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const timeout = setTimeout(() => {
      if (!localStorage.getItem(DISMISSED_KEY)) {
        setShow(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        localStorage.setItem(DISMISSED_KEY, '1');
      }
      setDeferredPrompt(null);
    }
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  }, []);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <div className={styles.bannerTop}>
          <img src="/icon-192.png" alt="XPAT Verify" className={styles.bannerIcon} />
          <div className={styles.bannerText}>
            <div className={styles.bannerTitle}>Install XPAT Verify</div>
            <div className={styles.bannerDesc}>
              Add to your home screen for quick access — works offline!
            </div>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <button className={styles.dismissBtn} onClick={handleDismiss}>
            Not Now
          </button>
          <button className={styles.installBtn} onClick={handleInstall}>
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
