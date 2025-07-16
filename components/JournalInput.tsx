'use client';
import { useState } from 'react';

type GPTResult = Record<string, string[] | string>;

interface Props {
  onResult: (data: GPTResult) => void;
}

export default function JournalInput({ onResult }: Props) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    const entries =
      mode === 'bulk' ? input.split(/\n{2,}/).map((e) => e.trim()) : [input];
    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ entries, mode }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setLoading(false);
    onResult(data);
  }

  return (
    <div className='p-4 space-y-4'>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        className='w-full border p-2 rounded'
        placeholder='Paste your journal entry...'
      />
      <div className='flex gap-4'>
        <label>
          <input
            type='radio'
            checked={mode === 'single'}
            onChange={() => setMode('single')}
          />{' '}
          Single Entry
        </label>
        <label>
          <input
            type='radio'
            checked={mode === 'bulk'}
            onChange={() => setMode('bulk')}
          />{' '}
          Bulk
        </label>
      </div>
      <button
        onClick={analyze}
        disabled={loading}
        className='bg-black text-white px-4 py-2 rounded'
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
}
