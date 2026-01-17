import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Linkedin, Dna, ArrowRight, File, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    experienceLevel: 'mid' as 'entry' | 'mid' | 'senior' | 'lead',
    description: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);

    // Extract filename and show details form
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    // Initialize with loading state
    setJobDetails(prev => ({
      ...prev,
      title: fileName || 'Uploaded Job',
      description: `Parsing job description from ${file.name}...\nPlease wait.`
    }));

    setShowDetailsForm(true);

    // Parse the file content
    try {
      setUploading(true);
      const response = await api.jobs.parseDescription(file);

      if (response && response.text) {

        // Helper to map experience string to level
        let experienceLevel = 'mid';
        if (response.experience) {
          const expStr = response.experience.toLowerCase();
          if (expStr.includes('0') || expStr.includes('1') || expStr.includes('entry')) experienceLevel = 'entry';
          else if (expStr.includes('senior') || expStr.includes('lead') || expStr.includes('5') || expStr.includes('6') || expStr.includes('7')) experienceLevel = 'senior';
          else if (expStr.includes('lead') || expStr.includes('principal') || expStr.includes('8') || expStr.includes('10')) experienceLevel = 'lead';
          // Default to mid for 2-4 years which is common
        }

        setJobDetails(prev => ({
          ...prev,
          description: response.text,
          location: response.location || prev.location,
          // Only update experience if we found something relevant, otherwise keep default
          experienceLevel: (response.experience ? experienceLevel : prev.experienceLevel) as any
        }));
      }
    } catch (err: any) {
      console.error('Failed to parse file:', err);
      // Fallback message with actual error
      setJobDetails(prev => ({
        ...prev,
        description: `Job description uploaded from file: ${file.name}\n\n(Auto-parsing failed: ${err.message || 'Unknown error'}. Please copy and paste the description here.)`
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleCreateJob = async () => {
    // Validate required fields
    if (!jobDetails.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!jobDetails.department.trim()) {
      setError('Department is required');
      return;
    }
    if (!jobDetails.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!jobDetails.description.trim()) {
      setError('Job description is required');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const jobData = {
        ...jobDetails,
        source: uploadedFile ? {
          type: 'upload',
          fileName: uploadedFile.name
        } : undefined
      };

      const job = await api.jobs.create(jobData);

      // Navigate to job DNA page with jobId
      navigate(`/dashboard/jobs/${job._id}/job-dna`);
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err.message || 'Failed to create job');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {!showDetailsForm ? (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Create New Job</h1>
            <p style={{ color: 'var(--gray-500)' }}>Choose how you want to create your job posting and generate Job DNA</p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              color: '#DC2626',
              fontSize: '0.875rem',
              maxWidth: '900px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', maxWidth: '900px' }}>
            {/* Upload JD */}
            <div
              className="card card-hover"
              style={{
                padding: '2.5rem',
                border: '2px dashed var(--gray-200)',
                textAlign: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                opacity: uploading ? 0.7 : 1
              }}
              onClick={!uploading ? handleUploadClick : undefined}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                {uploading ? (
                  <Loader size={36} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Upload size={36} color="#6366f1" />
                )}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>
                Upload Job Description
              </h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                Upload a PDF or DOC file to generate Job DNA
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                <File size={16} />
                <span>PDF, DOC, DOCX supported</span>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload File'} <ArrowRight size={18} />
              </button>
            </div>

            {/* LinkedIn Import */}
            <Link to="/dashboard/jobs/linkedin-import" className="card card-hover" style={{
              padding: '2.5rem',
              border: '2px solid var(--gray-200)',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'block'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(10, 102, 194, 0.1) 0%, rgba(0, 119, 181, 0.1) 100%)',
                borderRadius: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Linkedin size={36} color="#0a66c2" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>
                Import from LinkedIn
              </h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                Import job details and auto-generate Job DNA
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                <Dna size={16} />
                <span>AI-powered extraction</span>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Import from LinkedIn <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          {/* Job DNA Info */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '1rem',
            maxWidth: '900px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Dna size={20} color="#6366f1" />
              <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>What is Job DNA?</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
              Job DNA transforms your job description into structured role intelligence across 5 dimensions:
              Skill, Experience, Behavioral, Communication, and Cultural DNA. This powers fair, consistent
              AI interviews with explainable recommendations.
            </p>
          </div>
        </>
      ) : (
        <div style={{ maxWidth: '700px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Job Details</h1>
            <p style={{ color: 'var(--gray-500)' }}>Complete the job details to generate Job DNA</p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              color: '#DC2626',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="card" style={{ padding: '2rem', background: 'var(--white)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                  Job Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                  value={jobDetails.title}
                  onChange={(e) => setJobDetails(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Senior Full Stack Developer"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Department <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                    value={jobDetails.department}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Location <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                    value={jobDetails.location}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Remote, New York"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Employment Type
                  </label>
                  <select
                    className="input"
                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                    value={jobDetails.employmentType}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, employmentType: e.target.value as any }))}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Experience Level
                  </label>
                  <select
                    className="input"
                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                    value={jobDetails.experienceLevel}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead/Principal</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                  Job Description <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  className="input"
                  style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)', resize: 'vertical' }}
                  value={jobDetails.description}
                  onChange={(e) => setJobDetails(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter the full job description..."
                  rows={8}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDetailsForm(false);
                    setUploadedFile(null);
                    setError(null);
                  }}
                  disabled={uploading}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateJob}
                  disabled={uploading}
                  style={{ flex: 1 }}
                >
                  {uploading ? (
                    <>
                      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Creating Job...
                    </>
                  ) : (
                    <>
                      Create Job & Generate DNA
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
