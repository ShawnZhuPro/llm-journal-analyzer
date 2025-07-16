interface AnalysisResult {
  [key: string]: string[] | string;
}

export default function ResultDisplay({ result }: { result: AnalysisResult }) {
  return (
    <div className='p-4 space-y-6'>
      {Object.entries(result).map(([key, val]) => (
        <div key={key}>
          <h2 className='font-bold text-xl capitalize'>
            {key.replaceAll('_', ' ')}
          </h2>
          {Array.isArray(val) ? (
            <ul className='list-disc pl-4'>
              {val.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          ) : (
            <p>{typeof val === 'string' ? val : JSON.stringify(val)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
