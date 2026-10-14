'use client';

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-primary no-print" onClick={() => window.print()} style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.18)' }}>
      {label}
    </button>
  );
}
