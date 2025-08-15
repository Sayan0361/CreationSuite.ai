import React from 'react';
import Gauge from './Gauge'; 

const ATSResult = ({ data, theme }) => {
    // Ensure data exists and has the correct structure
    if (!data || typeof data !== 'object') {
        return (
            <div className={`text-red-500 p-4 ${
                theme === 'dark' ? 'bg-zinc-900' : 'bg-red-50'
            } rounded-lg`}>
                Invalid results data. Please try again.
            </div>
        )
    }

    return (
        <div className='mt-3 space-y-6 overflow-y-auto'>
            {/* Overall Score */}
            {'score' in data && (
                <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                }`}>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>Overall ATS Score</h3>
                        <span className={`text-xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{data.score}/100</span>
                    </div>
                    <Gauge value={data.score} theme={theme} />
                </div>
            )}

            {/* Score Breakdown */}
            {data.breakdown && typeof data.breakdown === 'object' && (
                <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                }`}>
                    <h3 className={`font-medium mb-3 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Skills Analysis</h3>
                    <div className='space-y-4'>
                        {Object.entries(data.breakdown).map(([skill, details]) => {
                            // Handle both simple values and detailed objects
                            const isDetailed = typeof details === 'object' && details !== null
                            const matchStatus = isDetailed ? details.match : details
                            const feedback = isDetailed ? details.feedback : ''

                            return (
                                <div key={skill} className={`p-3 rounded-lg ${
                                    theme === 'dark' ? 'bg-zinc-700' : 'bg-white border border-gray-200'
                                }`}>
                                    <div className='flex justify-between items-center'>
                                        <span className={`font-medium capitalize ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{skill.replace(/_/g, ' ')}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            matchStatus 
                                                ? theme === 'dark' 
                                                    ? 'bg-green-900 text-green-300' 
                                                    : 'bg-green-100 text-green-800'
                                                : theme === 'dark'
                                                    ? 'bg-red-900 text-red-300'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {matchStatus ? 'MATCH' : 'MISSING'}
                                        </span>
                                    </div>
                                    {feedback && (
                                        <p className={`text-sm mt-2 ${
                                            theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'
                                        }`}>{feedback}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Feedback */}
            {data.feedback && (
                <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                }`}>
                    <h3 className={`font-medium mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Summary Feedback</h3>
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'
                    }`}>{data.feedback}</p>
                </div>
            )}

            {/* Suggestions */}
            {data.suggestions && (
                <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                }`}>
                    <h3 className={`font-medium mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Improvement Suggestions</h3>
                    <ul className={`list-disc list-inside text-sm space-y-2 ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'
                    }`}>
                        {Array.isArray(data.suggestions) ? (
                            data.suggestions.map((suggestion, index) => (
                                <li key={index} className='leading-relaxed'>{suggestion}</li>
                            ))
                        ) : (
                            <li>{data.suggestions}</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ATSResult;