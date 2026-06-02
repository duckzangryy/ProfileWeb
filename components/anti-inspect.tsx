'use client';

import { useEffect } from 'react';

export default function AntiInspect() {
  useEffect(() => {

    class O {
      o: string;
      constructor() {
        this.o = Array.from(
          { length: 20 },
          () =>
            '\\x' +
            Math.floor(Math.random() * 16).toString(16) +
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
      }
    }

    const o = new O();
    document.querySelectorAll('*').forEach((el) => {
      el.classList.add(o.o);
    });

    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.ctrlKey && key === 'u')
      ) {
        e.preventDefault();
        document.body.innerHTML = btoa(document.body.innerHTML);
      }
    };
    document.addEventListener('keydown', handler);
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  return null;
}
