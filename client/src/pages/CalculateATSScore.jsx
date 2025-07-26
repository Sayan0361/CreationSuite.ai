import { FileText, Sparkles, BarChart2 } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ATSResult from './ATSResult'; // We'll create this component next

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const CalculateATSScore = () => {
    const [resume, setResume] = useState(null)
    const [jobDescription, setJobDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const {getToken} = useAuth()
      
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            if (!resume || !jobDescription.trim()) {
                return toast.error('Please upload a resume and enter a job description')
            }

            setLoading(true)
            const formData = new FormData()
            formData.append('resume', resume)
            formData.append('jobDescription', jobDescription)

            const { data } = await axios.post('/api/ai/calculate-ats-score', formData, {
                headers: { 
                    'Authorization': `Bearer ${await getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.success) {
                setResult(data.content)
                toast.success("ATS Score Calculated")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message || "Failed to calculate ATS score")
        }
        setLoading(false)
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-white'>
            {/* Left column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg '>
                <div className='flex items-center gap-3'>
                    <Sparkles className='w-6 text-[#4A7AFF]'/>
                    <h1 className='text-xl font-semibold'>ATS Score Calculator</h1>
                </div>
                
                <p className='mt-6 text-sm font-medium'>Upload Resume (PDF)</p>
                <input 
                    onChange={(e) => setResume(e.target.files[0])} 
                    type="file" 
                    accept='application/pdf' 
                    className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-white' 
                    required
                />
                <p className='text-xs text-white font-light mt-1'>Maximum file size: 5MB</p>
                
                <p className='mt-6 text-sm font-medium'>Job Description</p>
                <textarea 
                    onChange={(e) => setJobDescription(e.target.value)} 
                    value={jobDescription}
                    rows={6}
                    className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' 
                    placeholder='Paste the job description you are applying for...'
                    required
                />
                
                <button 
                    disabled={loading}
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#4A7AFF] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-70'
                >
                    {
                        loading ? 
                        <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
                        :
                        <BarChart2 className='w-5'/>
                    }
                    Calculate ATS Score
                </button>
            </form>
            
            {/* Right column - Results */}
            <div className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg flex flex-col min-h-96'>
                <div className='flex items-center gap-3'>
                    <BarChart2 className='w-5 h-5 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>ATS Score Results</h1>
                </div>

                {!result ? (
                    <div className='flex-1 flex justify-center items-center'>
                        <div className='text-sm flex flex-col items-center gap-5 text-white'>
                            <FileText className='w-9 h-9' />
                            <p className='text-center'>Upload your resume and job description to calculate your ATS compatibility score</p>
                        </div>
                    </div>
                ) : (
                    <ATSResult data={result} />
                )}
            </div>
        </div>
    )
}

export default CalculateATSScore