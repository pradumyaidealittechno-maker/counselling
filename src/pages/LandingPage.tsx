import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import {
  Sparkles, ArrowRight, CheckCircle, Play, FileText, Users,
  Video, MessageSquare, BarChart3, Clock, Dna,
  Brain, Target, TrendingUp, Shield, Layers, Star,
  Menu, X
} from 'lucide-react';


const problems = [
  { icon: FileText, title: 'Resume Overload', desc: 'Too many resumes, limited recruiter time' },
  { icon: Users, title: 'Manual Screening', desc: 'Inconsistent and time-consuming evaluations' },
  { icon: Clock, title: 'Scheduling Delays', desc: 'Interview coordination slows hiring' },
  { icon: MessageSquare, title: 'Inconsistent Interviews', desc: 'Unstructured and biased processes' },
  { icon: BarChart3, title: 'Subjective Decisions', desc: 'Lack of explainable hiring insights' },
];

function Counter({ value, duration = 2000 }: any) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.replace(/\D/g, ""));
    const incrementTime = 16;
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  const suffix = value.replace(/[0-9]/g, "");

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

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
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="nav-wrapper">
          {/* Logo */}
          <div
            className="nav-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="logo-box">
              <Sparkles size={20} color="white" />
            </div>
            <span>Intelligens</span>
          </div>

          {/* Links */}
          <div className="nav-links">
            <a href="#job-dna">Job DNA</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/login">Login</Link>

            <Link to="/signup" className="nav-btn text-white">
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
          <a href="#job-dna">Job DNA</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>

          <Link to="/login" className="nav-login-btn">
            Login
          </Link>

          <Link to="/signup" className="nav-signup-btn">
            Get Started
          </Link>

        </div>
      </nav>

      <style>
        {`
/* LOGIN BUTTON */

.nav-login-btn {
  padding: 10px 20px;
  border-radius: 999px ;
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-decoration: none;
 border-color: #ee1657ff;
  box-shadow: 0 6px 18px rgba(236,72,153,0.35);
  transition: all 0.3s ease;
}

.nav-login-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}


/* SIGNUP PRIMARY BUTTON */

.nav-signup-btn {
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-decoration: none;
  background: linear-gradient(135deg,#EC4899,#6366F1);
  box-shadow: 0 6px 18px rgba(236,72,153,0.35);
  transition: all 0.3s ease;
}

.nav-signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(99,102,241,0.45);
}


.nav-wrapper {
  max-width: 1280px;
  margin: auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg,#E91E63,#6366F1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-logo span {
  font-size: 1.3rem;
  font-weight: 700;
}

/* Links */

.nav-links {
  display: flex;
  align-items: center;
  gap: 22px;
}

.nav-links a {
  font-size: 0.85rem;
  color: #6B7280;
  text-decoration: none;
      font-weight: bold;
    text-transform: uppercase;
}

.nav-btn {
  background: linear-gradient(135deg,#EC4899,#6366F1);
  color: #ffffffff !important;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

/* Hamburger */

.nav-hamburger {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* Mobile Menu */

.mobile-menu {
  display: none;
}

/* ---------------- TABLET ---------------- */

@media (max-width: 1024px) {

  .nav-links a:nth-child(3) {
    display: none;
  }

  .nav-hamburger {
    display: block;
  }
}

/* ---------------- MOBILE ---------------- */

@media (max-width: 768px) {

  .nav-links {
    display: none;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 0px 20px;
    background: white;
    border-top: 1px solid #e5e7eb;

    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease;
  }

  .mobile-menu.open {
    max-height: 400px;
  }

  .mobile-menu a {
    text-decoration: none;
    color: #374151;
    font-size: 0.9rem;
  }

  .mobile-btn {
    width: fit-content;
  }
}
`}
      </style>

      {/* Main Content */}
      <main style={{ paddingTop: '65px' }}>

        {/* Hero Section */}
        <section
          className="gradient-bg"
          style={{
            minHeight: "auto",
            display: "flex",
            alignItems: "center",


            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* PINK BLUR */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "10%",
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle, rgba(233, 30, 99, 0.2) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(60px)",
              zIndex: 1,
            }}
          />

          {/* BLUE BLUR */}
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "10%",
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(60px)",
              zIndex: 1,
            }}
          />

          {/* MAIN GRID */}
          <div
            className="hero-grid"
            style={{
              maxWidth: "1300px",
              margin: "0 auto",
              padding: "0 20px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              alignItems: "center",
              gap: "40px",
              position: "relative",
              zIndex: 5,
            }}
          >
            {/* LEFT CONTENT */}
            <div style={{ position: "relative", zIndex: 10, paddingBottom: 40, paddingTop: 40, marginRight: "118px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(163, 139, 250, 0.2)",
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  marginBottom: "1.5rem",
                }}
              >
                <Dna size={16} color="#A78BFA" />
                <span
                  style={{
                    color: "#6366F1",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Powered by Job DNA
                </span>
              </div>

              <h1
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 800,
                  color: "#1F2937",
                  lineHeight: 1.1,
                  marginBottom: "1.5rem",
                }}
              >
                Hire Smarter.
                <br />
                Interview Faster.
                <br />
                <span className="gradient-text">Decide with Intelligence.</span>
              </h1>

              <p
                style={{
                  fontSize: "1.25rem",
                  color: "#6B7280",
                  marginBottom: "2rem",
                  maxWidth: "500px",
                }}
              >
                AI-powered recruitment with Job DNA — structured role intelligence that
                powers fair, explainable hiring decisions with humans always in control.
              </p>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started <ArrowRight size={20} />
                </Link>

                <button className="btn btn-secondary btn-lg">
                  <Play size={20} /> Book a Demo
                </button>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div
              className="hero-img"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              <img
                src="/images/business-woman-banner.png"
                alt="Hero Person"
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  objectFit: "contain",
                  zIndex: 10,
                  paddingTop: 30,
                  filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.15))",
                }}
              />
            </div>
          </div>


          <style>{`
    @media (max-width: 900px) {
      .hero-grid {
        grid-template-columns: 1fr !important;
        text-align: center;
      }

      .hero-img {
        margin-top: 40px;
      }

      h1 {
        font-size: 2.2rem !important;
      }
    }
  `}</style>

        </section>

        <section
          style={{
            padding: "4rem 1.2rem",
            background: "linear-gradient(135deg, #e289cb, #6366F1 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "12%",
              right: "5%",
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)",
              filter: "blur(90px)",
            }}
          />

          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "2.5rem",
                alignItems: "start",
              }}
            >
              {/* LEFT SIDE */}
              <div>
                <h1
                  style={{
                    fontSize: " 2.6rem)",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: "1.2",
                    marginBottom: "1rem",
                  }}
                >
                  Find Jobs That Truly Match You.
                  <br />
                  Powered by AI <span
                    style={{
                      animation: "dnaBlink 5s ease-in-out infinite",
                      fontWeight: "700",
                    }}
                  >
                    Job DNA
                  </span>

                  <style>
                    {`
@keyframes dnaBlink {
  0% {
    color: #05e0f4ff;
    text-shadow: 0 0 6px #f9f9f763;
  }

  50% {
    color: #6366F1;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.31);
  }

  100% {
    color: #38f413ff;
    text-shadow: 0 0 6px rgba(253, 250, 252, 0.19);
  }
}
`}
                  </style>



                </h1>

                <p
                  style={{
                    fontSize: "16px",
                    color: "#ffffff",
                    maxWidth: "480px",
                    lineHeight: "1.8",
                  }}
                >
                  Stop applying blindly and wasting hours on irrelevant job listings. Our
                  AI-powered Job DNA technology deeply analyzes your skills, experience,
                  strengths, and career goals to understand what truly fits you. Instead of
                  showing thousands of random openings,
                  {/* we intelligently match you with
                  high-quality, personalized opportunities that align with your professional
                  profile and long-term growth. Discover roles that pay better, match your
                  potential, and move your career forward — faster, smarter, and with
                  confidence. */}
                </p>
              </div>


              {/* RIGHT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>



                {/* JOB DNA PROFILE */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "18px",
                    padding: "1.4rem",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 14px 35px rgba(0,0,0,0.08)",

                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      marginBottom: "10px",
                    }}
                  >
                    Job DNA Profile
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,1fr)",
                      gap: "10px",
                    }}
                  >
                    {["React", "Problem Solving", "Communication", "Leadership"].map(
                      (item, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            borderRadius: "10px",
                            padding: "10px",
                          }}
                        >
                          <p style={{ fontSize: "13px", marginBottom: "6px" }}>
                            {item}
                          </p>

                          <div
                            style={{
                              height: "6px",
                              background: "#E5E7EB",
                              borderRadius: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: `${70 + i * 6}%`,
                                height: "100%",
                                background: "#EC4899",
                                borderRadius: "6px",
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Stats Section */}
        <section
          style={{
            width: "100%",
            background: "#ffffff",
            color: "#222222",
            padding: "50px 16px",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >

            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#222222",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                Platform Impact
              </p>

              <h3
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "#222222",
                }}
              >
                Trusted Performance Metrics
              </h3>
            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    padding: "1.8rem 1.5rem",
                    borderRadius: "18px",
                    border: "1px solid #E5E7EB",
                    textAlign: "center",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 35px rgba(236,72,153,0.18)";
                    e.currentTarget.style.borderColor = "#FBCFE8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 30px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >

                  <p
                    style={{
                      fontSize: "2.4rem",
                      fontWeight: 800,
                      color: "#EC4899",
                      marginBottom: "6px",
                    }}
                  >
                    <Counter value={stat.value} />
                  </p>

                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    {stat.label}
                  </p>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Problems Section */}
        <section
          style={{
            padding: "clamp(3rem, 6vw, 4rem) 1rem",
            background: "linear-gradient(135deg, #e289cb, #6366F1 100%)",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 5vw, 4rem)" }}>
              <span
                style={{
                  color: "#ffffffff",
                  fontWeight: 600,
                  fontSize: "clamp(14px, 2vw, 18px)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                The Challenge
              </span>

              <h2
                style={{
                  fontSize: "clamp(22px, 4vw, 30px)",
                  fontWeight: 700,
                  color: "#ffffffff",
                  marginTop: "0.5rem",
                }}
              >
                Hiring Today Is Broken
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {problems.map((problem, i) => (
                <div
                  key={i}
                  className="card card-hover"
                  style={{
                    textAlign: "center",
                    padding: "clamp(1.4rem, 3vw, 2rem) 1.5rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    background: "#ffffff",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "clamp(48px, 6vw, 60px)",
                      height: "clamp(48px, 6vw, 60px)",
                      background: "rgba(239, 68, 68, 0.1)",
                      borderRadius: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <problem.icon size={26} color="#ef4444" />
                  </div>

                  <h3
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      fontSize: "clamp(15px, 2vw, 17px)",
                    }}
                  >
                    {problem.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "clamp(13px, 1.8vw, 14px)",
                      color: "#6b7280",
                      lineHeight: "1.6",
                    }}
                  >
                    {problem.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section
          style={{
            padding: "clamp(3rem, 6vw, 4rem) 1rem",
            background: "#f9fafb",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "clamp(2rem, 5vw, 4rem)",
                alignItems: "center",
              }}
            >
              {/* LEFT CONTENT */}
              <div>
                <span
                  style={{
                    color: "#6366F1",
                    fontWeight: 600,
                    fontSize: "clamp(12px, 2vw, 14px)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  The Solution
                </span>

                <h2
                  style={{
                    fontSize: "clamp(22px, 4vw, 40px)",
                    fontWeight: 700,
                    color: "#1F2937",
                    marginTop: "0.5rem",
                    marginBottom: "1.5rem",
                    lineHeight: "1.2",
                  }}
                >
                  Meet Intelligens — Your AI Hiring Assistant
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "Import or upload job descriptions",
                    "Generate Job DNA from role requirements",
                    "Human review and approval of Job DNA",
                    "AI-led structured interviews",
                    "Explainable hiring recommendations",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <CheckCircle size={20} color="#10b981" />

                      <span
                        style={{
                          fontSize: "clamp(14px, 2vw, 16px)",
                          color: "#374151",
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT CARD */}
              <div
                style={{
                  background: "linear-gradient(135deg, #E91E63 0%, #6366F1 100%)",
                  borderRadius: "1.5rem",
                  padding: "clamp(1.8rem, 4vw, 3rem)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-50px",
                    right: "-50px",
                    width: "200px",
                    height: "200px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                  }}
                />

                <Sparkles

                  color="white"
                  style={{ marginBottom: "1.5rem" }}
                />

                <h3
                  style={{
                    color: "white",
                    fontSize: "clamp(18px, 3vw, 24px)",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  AI Assistance with Human Control
                </h3>

                <ul
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "clamp(13px, 2vw, 14px)",
                    lineHeight: 2,
                    paddingLeft: "0",
                    listStyle: "none",
                  }}
                >
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
        <section
          id="job-dna"
          style={{
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, #e289cb, #6366F1 100%)',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                marginBottom: '4rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                }}
              >
                <Dna size={16} color="#E91E63" />
                <span
                  style={{
                    color: '#ff0055ff',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Core Feature
                </span>
              </div>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#ffffffff',
                  marginBottom: '0.5rem',
                }}
              >
                Job DNA — Role Intelligence, Not Just Text
              </h2>
              <p
                style={{
                  color: '#fffffb',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}
              >
                Job DNA transforms static job descriptions into structured role intelligence
                that powers fair, consistent, and explainable hiring.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // responsive grid
              }}
            >
              {[
                { icon: Layers, title: 'Structured Understanding', desc: 'Break down roles into measurable dimensions' },
                { icon: Shield, title: 'Human Approved', desc: 'Every Job DNA requires human review' },
                { icon: Brain, title: 'Powers AI Interviews', desc: 'AI agents trained on approved Job DNA' },
                { icon: Target, title: 'Ensures Fairness', desc: 'Consistent evaluation across all candidates' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      background:
                        'linear-gradient(135deg, rgba(235, 189, 205, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      borderRadius: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <item.icon size={28} color="#E91E63" />
                  </div>
                  <h3
                    style={{
                      color: '#1F2937',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      color: '#6B7280',
                      fontSize: '0.875rem',
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          style={{
            padding: '4rem 2rem',
            background: '#f3f4f6',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span
                style={{
                  color: '#6366F1',
                  fontWeight: 600,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Process
              </span>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#1F2937',
                  marginTop: '0.5rem',
                }}
              >
                How It Works
              </h2>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap', // responsive wrap
                position: 'relative',
              }}
            >
              {/* Connecting line (hidden on small screens) */}
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)',
                  zIndex: 0,
                }}
                className="line-desktop"
              />

              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                    flex: '1 1 200px', // makes steps responsive
                    margin: '1rem 0',   // spacing for stacked layout
                    minWidth: '120px',
                  }}
                >
                  <div
                    style={{
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
                      color: 'white',
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    style={{
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#1F2937',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      maxWidth: '150px',
                      margin: '0 auto',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Extra inline style for responsiveness */}
          <style>
            {`
      @media (max-width: 768px) {
        #how-it-works .line-desktop {
          display: none; /* hide line on small screens */
        }
      }
    `}
          </style>
        </section>

        {/* Features Grid */}
        <section
          id="features"
          style={{
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, #e289cb, #6366F1 100%)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span
                style={{
                  color: '#ffffffff',
                  fontWeight: 600,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Features
              </span>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#ffffffff',
                  marginTop: '0.5rem',
                }}
              >
                Everything You Need to Hire Better
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '2rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // responsive columns
              }}
            >
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="card card-hover"
                  style={{
                    padding: '2rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '1rem',
                    background: 'white',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      background:
                        'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      borderRadius: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <feature.icon size={28} color="#E91E63" />
                  </div>
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                    }}
                  >
                    {feature.desc}
                  </p>
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
                fontSize: '18px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>Testimonials</span>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#1F2937',
                marginTop: '0.5rem'
              }}>What Our Customers Say</h2>
            </div>

            {/* Marquee Wrapper */}
            <div style={{
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                animation: 'marquee 20s linear infinite'
              }}>
                {testimonials.concat(testimonials).map((testimonial, i) => (
                  <div key={i} className="card" style={{
                    flex: '0 0 300px', // width of each card
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '1rem',
                    background: 'white'
                  }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <p style={{
                      color: '#4b5563',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      marginBottom: '1.5rem',
                      fontStyle: 'italic'
                    }}>
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
          </div>

          {/* Marquee animation */}
          <style>
            {`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      @media (max-width: 768px) {
        .card {
          flex: 0 0 80%; /* responsive card width on mobile */
        }
      }
    `}
          </style>
        </section>


        {/* CTA Section */}
        <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #e289cb, #6366F1 100%)' }}>
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
        <footer className="footer">
          <div className="footer-container">

            {/* Top Grid */}
            <div className="footer-grid">

              {/* Brand */}
              <div className="footer-brand">
                <div className="footer-logo">
                  <div className="footer-icon">
                    <Sparkles size={22} color="white" />
                  </div>
                  <span>Intelligens</span>
                </div>

                <p>
                  AI-powered recruitment with Job DNA™ for modern HR teams.
                </p>
              </div>

              {[
                { title: "Product", links: ["Features", "Job DNA™", "Pricing", "API"] },
                { title: "Solutions", links: ["Enterprise", "Startups", "Agencies", "Remote"] },
                { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
                { title: "Legal", links: ["Privacy", "Terms", "Security", "Contact"] },
              ].map((col, i) => (
                <div className="footer-col" key={i}>
                  <h4>{col.title}</h4>
                  {col.links.map((link, j) => (
                    <a key={j} href="#">
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom */}
            <div className="footer-bottom">
              © 2026 Intelligens. All rights reserved. Job DNA™ is a trademark of Intelligens.
            </div>

          </div>

          {/* Footer Responsive CSS */}
          <style>
            {`
    .footer {
      background: #1F2937;
      padding: 3rem 1.5rem 1.5rem;
    }

    .footer-container {
      max-width: 1280px;
      margin: auto;
    }

    /* GRID */

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    /* BRAND */

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .footer-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg,#E91E63,#6366F1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .footer-logo span {
      font-size: 1.2rem;
      font-weight: 700;
      color: white;
    }

    .footer-brand p {
      color: #9CA3AF;
      font-size: 0.875rem;
      max-width: 300px;
      line-height: 1.6;
    }

    /* COLUMNS */

    .footer-col h4 {
      color: white;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .footer-col a {
      display: block;
      color: #9CA3AF;
      font-size: 0.875rem;
      margin-bottom: 8px;
      text-decoration: none;
      transition: 0.2s;
    }

    .footer-col a:hover {
      color: #ffffff;
      transform: translateX(4px);
    }

    /* BOTTOM */

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 1.5rem;
      text-align: center;
      color: #6B7280;
      font-size: 0.875rem;
    }

    /* ---------- TABLET ---------- */

    @media (max-width: 1024px) {

      .footer-grid {
        grid-template-columns: 1.5fr 1fr 1fr;
        gap: 2rem;
      }

    }

    /* ---------- MOBILE ---------- */

    @media (max-width: 640px) {

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-brand p {
        max-width: 100%;
      }

      .footer-bottom {
        font-size: 0.8rem;
      }

    }
    `}
          </style>
        </footer>

      </main>
    </div>
  );
}
