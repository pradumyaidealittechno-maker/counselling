import { Link } from 'react-router-dom';
import { Upload, Linkedin, Dna, ArrowRight, File } from 'lucide-react';

export default function CreateJob() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create New Job</h1>
        <p style={{ color: '#6b7280' }}>Choose how you want to create your job posting and generate Job DNA</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', maxWidth: '900px' }}>
        {/* Upload JD */}
        <Link to="/dashboard/jobs/job-dna" className="card card-hover" style={{
          padding: '2.5rem',
          border: '2px dashed #e5e7eb',
          textAlign: 'center',
          cursor: 'pointer',
          display: 'block'
        }}>
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
            <Upload size={36} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Upload Job Description
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
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
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Upload File <ArrowRight size={18} />
          </button>
        </Link>

        {/* LinkedIn Import */}
        <Link to="/dashboard/jobs/linkedin-import" className="card card-hover" style={{
          padding: '2.5rem',
          border: '2px solid #e5e7eb',
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Import from LinkedIn
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
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
          <span style={{ fontWeight: 600 }}>What is Job DNA?</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
          Job DNA transforms your job description into structured role intelligence across 5 dimensions: 
          Skill, Experience, Behavioral, Communication, and Cultural DNA. This powers fair, consistent 
          AI interviews with explainable recommendations.
        </p>
      </div>
    </div>
  );
}
