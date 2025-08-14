import { FileText, Sparkles, BarChart2, Copy } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ATSResult from './ATSResult';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const CalculateATSScore = () => {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');

  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setFileName(file.name);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!resume || !jobDescription.trim()) {
        return toast.error('Please upload a resume and enter a job description');
      }

      setLoading(true);
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jobDescription', jobDescription);

      const { data } = await axios.post('/api/ai/calculate-ats-score', formData, {
        headers: { 
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        const formattedResult = formatATSResult(data.content);
        setResult(formattedResult);
        toast.success("ATS Score Calculated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to calculate ATS score");
    }
    setLoading(false);
  };

  const formatATSResult = (data) => {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (parsedData && !parsedData.score && typeof parsedData === 'object') {
        const matchedSkills = Object.values(parsedData).filter(skill => skill.match).length;
        const totalSkills = Object.keys(parsedData).length;
        const score = Math.round((matchedSkills / totalSkills) * 100);
        
        const suggestions = Object.entries(parsedData).map(([skill, details]) => {
          return details.match 
            ? `Strong match for ${skill}: ${details.feedback || ''}`
            : `Missing or weak ${skill}: ${details.feedback || 'Consider adding this skill'}`;
        });

        return {
          score,
          breakdown: parsedData,
          feedback: `Your resume matches ${matchedSkills} out of ${totalSkills} key skills`,
          suggestions
        };
      }
      
      return parsedData;
    } catch (e) {
      console.error("Error formatting ATS result:", e);
      return {
        score: 0,
        breakdown: {},
        feedback: "Could not parse results",
        suggestions: ["Please try again or check your inputs"]
      };
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `
      ATS Score: ${result.score}/100
      Feedback: ${result.feedback}
      Suggestions: ${result.suggestions.join('\n- ')}
    `;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className='h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 text-white'>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg'>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className='w-6 h-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>ATS Score Calculator</h1>
        </div>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Upload Resume (PDF)</label>
            <div className="relative">
              <input
                onChange={handleFileChange}
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-between">
                <span className={`truncate ${fileName ? 'text-white' : 'text-gray-400'}`}>
                  {fileName || 'Select PDF file'}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-md transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('input[type="file"]').click();
                  }}
                >
                  Browse
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">Maximum file size: 5MB</p>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Job Description</label>
            <textarea
              onChange={(e) => setJobDescription(e.target.value)}
              value={jobDescription}
              rows={6}
              className='w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg outline-none text-sm'
              placeholder='Paste the job description you are applying for...'
              required
            />
          </div>

          <button
            disabled={loading || !resume || !jobDescription.trim()}
            className={`w-full flex justify-center items-center gap-2 text-white px-4 py-3 text-sm rounded-lg transition-all ${
              !resume || !jobDescription.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#4A7AFF] to-[#8E37EB] hover:shadow-lg hover:shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <>
                <BarChart2 className='w-5 h-5' />
                Calculate ATS Score
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <BarChart2 className='w-6 h-6 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>ATS Score Results</h1>
          </div>
          {result && (
            <button
              onClick={copyToClipboard}
              className='flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all'
              title="Copy results"
            >
              <Copy className='w-4 h-4' />
              Copy
            </button>
          )}
        </div>

        {!result ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400'>
              <FileText className='w-10 h-10 opacity-50' />
              <p>Upload your resume and job description to calculate your ATS compatibility score</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto pr-2'>
            <ATSResult data={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculateATSScore;