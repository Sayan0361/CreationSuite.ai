import React from 'react';
import  Gauge from './Gauge'; // We'll create this component too

const ATSResult = ({ data }) => {
    // Ensure data is properly parsed
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    
    return (
        <div className='mt-3 space-y-6 overflow-y-auto'>
            {/* Overall Score */}
            <div className='bg-zinc-800 p-4 rounded-lg'>
                <div className='flex justify-between items-center mb-4'>
                    <h3 className='font-medium'>Overall ATS Score</h3>
                    <span className='text-xl font-bold'>{result.score}/100</span>
                </div>
                <Gauge value={result.score} />
            </div>

            {/* Score Breakdown */}
            <div className='bg-zinc-800 p-4 rounded-lg'>
                <h3 className='font-medium mb-3'>Score Breakdown</h3>
                <div className='space-y-3'>
                    {Object.entries(result.breakdown).map(([category, score]) => (
                        <div key={category} className='flex items-center'>
                            <div className='w-32 capitalize'>
                                {category.replace(/_/g, ' ')}:
                            </div>
                            <div className='flex-1 bg-zinc-700 rounded-full h-2.5'>
                                <div 
                                    className='bg-blue-500 h-2.5 rounded-full' 
                                    style={{ width: `${score}%` }}
                                ></div>
                            </div>
                            <div className='w-10 text-right ml-2'>
                                {score}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback */}
            <div className='bg-zinc-800 p-4 rounded-lg'>
                <h3 className='font-medium mb-2'>Feedback</h3>
                <p className='text-sm'>{result.feedback}</p>
            </div>

            {/* Suggestions */}
            <div className='bg-zinc-800 p-4 rounded-lg'>
                <h3 className='font-medium mb-2'>Improvement Suggestions</h3>
                <ul className='list-disc list-inside text-sm space-y-1'>
                    {result.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ATSResult;