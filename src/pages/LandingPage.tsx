import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle, Play, FileText, Users,
  Video, MessageSquare, BarChart3, Clock, Dna,
  Brain, Target, TrendingUp, Shield, Layers, Zap, Globe, Award, Star
} from 'lucide-react';

const problems = [
  { icon: FileText, title: 'Resume Overload', desc: 'Too many resumes, limited recruiter time' },
  { icon: Users, title: 'Manual Screening', desc: 'Inconsistent and time-consuming evaluations' },
  { icon: Clock, title: 'Scheduling Delays', desc: 'Interview coordination slows hiring' },
  { icon: MessageSquare, title: 'Inconsistent Interviews', desc: 'Unstructured and biased processes' },
  { icon: BarChart3, title: 'Subjective Decisions', desc: 'Lack of explainable hiring insights' },
];

const features = [
  { icon: Brain, title: 'AI Resume Screening', desc: 'Automatically screen and rank candidates based on Job DNA match scores' },
  { icon: FileText, title: 'LinkedIn JD Import', desc: 'Import job descriptions instantly with AI-powered extraction and human review' },
  { icon: Dna, title: 'Job DNA Framework', desc: 'Structured role intelligence across 5 dimensions for consistent evaluation' },
  { icon: Video, title: 'AI Video Interviews', desc: 'Conduct structured one-way interviews with our AI interviewer Monika' },
  { icon: MessageSquare, title: 'Live Transcription', desc: 'Real-time transcription, sentiment analysis, and keyword detection' },
  { icon: TrendingUp, title: 'Explainable Hire/No-Hire', desc: 'AI recommendations with clear reasoning tied to Job DNA traits' },
];

const steps = [
  { num: '01', title: 'Upload or Import JD', desc: 'Upload job description or import from LinkedIn' },
  { num: '02', title: 'Review Job DNA', desc: 'Approve AI-generated role intelligence' },
  { num: '03', title: 'Train AI Agent', desc: 'AI learns from approved Job DNA' },
  { num: '04', title: 'Invite Candidates', desc: 'Send interview invitations' },
  { num: '05', title: 'Get Insights', desc: 'Explainable hiring recommendations' },
];

const jobDnaTraits = [
  { name: 'Skill DNA', desc: 'Technical competencies required' },
  { name: 'Experience DNA', desc: 'Years and type of experience' },
  { name: 'Behavioral DNA', desc: 'Work style and soft skills' },
  { name: 'Communication DNA', desc: 'Expression and clarity' },
];

const stats = [
  { value: '85%', label: 'Faster Hiring', desc: 'Reduce time-to-hire with AI automation' },
  { value: '3x', label: 'More Candidates', desc: 'Screen more applicants in less time' },
  { value: '92%', label: 'Accuracy Rate', desc: 'Job DNA match prediction accuracy' },
  { value: '60%', label: 'Cost Reduction', desc: 'Lower recruitment costs per hire' },
];

const testimonials = [
  { name: 'Jennifer Martinez', role: 'VP of Talent, TechCorp', text: 'Intelligens transformed our hiring process. We reduced time-to-hire by 70% while improving candidate quality.', avatar: 'JM' },
  { name: 'David Park', role: 'HR Director, StartupXYZ', text: 'The Job DNA framework gives us consistent, fair evaluations. Our hiring decisions are now data-driven and explainable.', avatar: 'DP' },
  { name: 'Sarah Thompson', role: 'Recruiting Lead, GlobalInc', text: 'AI video interviews save us 20+ hours per week. Candidates love the flexibility, and we get better insights.', avatar: 'ST' },
];

const trustedBy = ['TechCorp', 'StartupXYZ', 'GlobalInc', 'InnovateCo', 'FutureLabs', 'ScaleUp'];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={24} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}>Intelligens</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#job-dna" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Job DNA</a>
            <a href="#features" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Features</a>
            <a href="#how-it-works" style={{ color: '#6B7280', fontSize: '0.875rem' }}>How It Works</a>
            <Link to="/login" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg" style={{
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '100px',
        paddingBottom: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(233, 30, 99, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(163, 139, 250, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              marginBottom: '1.5rem'
            }}>
              <Dna size={16} color="#A78BFA" />
              <span style={{ color: '#6366F1', fontSize: '0.875rem', fontWeight: 500 }}>
                Powered by Job DNA
              </span>
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: '#1F2937',
              lineHeight: 1.1,
              marginBottom: '1.5rem'
            }}>
              Hire Smarter.<br />
              Interview Faster.<br />
              <span className="gradient-text">Decide with Intelligence.</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6B7280',
              marginBottom: '2rem',
              maxWidth: '500px'
            }}>
              AI-powered recruitment with Job DNA — structured role intelligence that powers
              fair, explainable hiring decisions with humans always in control.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={20} />
              </Link>
              <button className="btn btn-outline btn-lg">
                <Play size={20} /> Book a Demo
              </button>
            </div>
          </div>

          {/* Hero Visual - Job DNA Card */}
          <div style={{ position: 'relative' }}>
            <div className="animate-float" style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Dna size={30} color="white" />
                </div>
                <div>
                  <p style={{ color: '#1F2937', fontWeight: 600 }}>Job DNA Analysis</p>
                  <p style={{ color: '#E91E63', fontSize: '0.875rem' }}>● Senior Software Engineer</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {jobDnaTraits.map((trait, i) => (
                  <div key={i} style={{
                    background: '#F3F4F6',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{trait.name}</span>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      background: '#E5E7EB',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${70 + i * 8}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={14} color="#10B981" />
                <span style={{ color: '#10B981', fontSize: '0.75rem' }}>Human Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section style={{ padding: '3rem 2rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Trusted by leading companies worldwide
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {trustedBy.map((company, i) => (
              <span key={i} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#d1d5db' }}>{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>{stat.value}</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{stat.label}</p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>The Challenge</span>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginTop: '0.5rem'
            }}>Hiring Today Is Broken</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1.5rem'
          }}>
            {problems.map((problem, i) => (
              <div key={i} className="card card-hover" style={{
                textAlign: 'center',
                padding: '2rem 1.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <problem.icon size={28} color="#ef4444" />
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{problem.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section style={{ padding: '4rem 2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div>
              <span style={{
                color: '#6366F1',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>The Solution</span>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#1F2937',
                marginTop: '0.5rem',
                marginBottom: '1.5rem'
              }}>Meet Intelligens — Your AI Hiring Assistant</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Import or upload job descriptions',
                  'Generate Job DNA from role requirements',
                  'Human review and approval of Job DNA',
                  'AI-led structured interviews',
                  'Explainable hiring recommendations'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={22} color="#10b981" />
                    <span style={{ fontSize: '1rem', color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              borderRadius: '1.5rem',
              padding: '3rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }} />
              <Sparkles size={48} color="white" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                AI Assistance with Human Control
              </h3>
              <ul style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', lineHeight: 2 }}>
                <li>• AI interview agents trained on Job DNA</li>
                <li>• Human-in-the-loop approval for all critical steps</li>
                <li>• Live transcription and structured analysis</li>
                <li>• Explainable recommendations you can trust</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Job DNA Section */}
      <section id="job-dna" style={{ padding: '4rem 2rem', background: '#FAF5FF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(233, 30, 99, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              marginBottom: '1rem'
            }}>
              <Dna size={16} color="#E91E63" />
              <span style={{ color: '#E91E63', fontSize: '0.875rem', fontWeight: 500 }}>Core Feature</span>
            </div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '0.5rem'
            }}>Job DNA — Role Intelligence, Not Just Text</h2>
            <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
              Job DNA transforms static job descriptions into structured role intelligence
              that powers fair, consistent, and explainable hiring.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }}>
            {[
              { icon: Layers, title: 'Structured Understanding', desc: 'Break down roles into measurable dimensions' },
              { icon: Shield, title: 'Human Approved', desc: 'Every Job DNA requires human review' },
              { icon: Brain, title: 'Powers AI Interviews', desc: 'AI agents trained on approved Job DNA' },
              { icon: Target, title: 'Ensures Fairness', desc: 'Consistent evaluation across all candidates' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <item.icon size={28} color="#E91E63" />
                </div>
                <h3 style={{ color: '#1F2937', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{
              color: '#6366F1',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Features</span>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginTop: '0.5rem'
            }}>Everything You Need to Hire Better</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem'
          }}>
            {features.map((feature, i) => (
              <div key={i} className="card card-hover" style={{
                padding: '2rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <feature.icon size={28} color="#E91E63" />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '4rem 2rem', background: '#f3f4f6' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{
              color: '#6366F1',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Process</span>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginTop: '0.5rem'
            }}>How It Works</h2>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)'
            }} />
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white'
                }}>{step.num}</div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1F2937' }}>{step.title}</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', maxWidth: '150px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              color: '#E91E63',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Testimonials</span>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginTop: '0.5rem'
            }}>What Our Customers Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {testimonials.map((testimonial, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>{testimonial.avatar}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>{testimonial.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '1rem'
          }}>Start Hiring with Intelligens</h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '2rem'
          }}>
            Join HR teams using Job DNA™ to make faster, fairer, and more explainable hiring decisions
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-lg" style={{
              background: 'white',
              color: '#E91E63'
            }}>
              Get Started <ArrowRight size={20} />
            </Link>
            <button className="btn btn-outline btn-lg">Talk to Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1F2937', padding: '3rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={24} color="white" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Intelligens</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', maxWidth: '300px' }}>
                AI-powered recruitment with Job DNA™ for modern HR teams.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Job DNA™', 'Pricing', 'API'] },
              { title: 'Solutions', links: ['Enterprise', 'Startups', 'Agencies', 'Remote'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Contact'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>{col.title}</h4>
                {col.links.map((link, j) => (
                  <a key={j} href="#" style={{
                    display: 'block',
                    color: '#9ca3af',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            © 2026 Intelligens. All rights reserved. Job DNA™ is a trademark of Intelligens.
          </div>
        </div>
      </footer>
    </div>
  );
}
