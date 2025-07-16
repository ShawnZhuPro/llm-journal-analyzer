'use client';
import { useState } from 'react';
import JournalInput from '@/components/JournalInput';
import ResultDisplay from '@/components/ResultDisplay';

export default function Home() {
  type GPTResult = Record<string, string[] | string>;
  const [result, setResult] = useState<GPTResult | null>(null);
  return (
    <main className='max-w-3xl mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-4'>LLM Trading Journal Analyzer</h1>
      <JournalInput onResult={setResult} />
      {result && <ResultDisplay result={result} />}
    </main>
  );
}
