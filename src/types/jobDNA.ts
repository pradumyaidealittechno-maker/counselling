// Job DNA™ Type Definitions
// Proprietary Role-Intelligence Framework by Intelligens

// Importance levels for DNA traits
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

// DNA Dimensions
export type DNADimension = 
  | 'Skill DNA' 
  | 'Experience DNA' 
  | 'Behavioral DNA' 
  | 'Communication DNA' 
  | 'Cultural DNA';

// Skill depth levels
export type SkillDepth = 'beginner' | 'intermediate' | 'expert';

// Skill category
export type SkillCategory = 'must-have' | 'nice-to-have';

// Base DNA Trait
export interface BaseDNATrait {
  id: string;
  trait: string;
  importance: ImportanceLevel;
  editable: boolean;
  description?: string;
}

// Skill DNA Trait
export interface SkillDNATrait extends BaseDNATrait {
  dimension: 'Skill DNA';
  category: SkillCategory;
  depth: SkillDepth;
  tools?: string[];
}

// Experience DNA Trait
export interface ExperienceDNATrait extends BaseDNATrait {
  dimension: 'Experience DNA';
  yearsRange?: {
    min: number;
    max: number;
    flexible: boolean;
  };
  seniorityLevel?: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  domainExposure?: string[];
  decisionMakingLevel?: 'Individual' | 'Team' | 'Department' | 'Organization';
}

// Behavioral DNA Trait
export interface BehavioralDNATrait extends BaseDNATrait {
  dimension: 'Behavioral DNA';
  behaviorType: 'ownership' | 'accountability' | 'collaboration' | 'adaptability' | 'leadership';
}

// Communication DNA Trait
export interface CommunicationDNATrait extends BaseDNATrait {
  dimension: 'Communication DNA';
  communicationType: 'clarity' | 'structured' | 'confidence' | 'stakeholder';
}

// Cultural DNA Trait (Optional dimension)
export interface CulturalDNATrait extends BaseDNATrait {
  dimension: 'Cultural DNA';
  cultureType: 'pace' | 'autonomy' | 'precision';
  spectrum?: {
    left: string;
    right: string;
    position: number; // 0-100, where 50 is neutral
  };
}

// Union type for all DNA traits
export type DNATrait = 
  | SkillDNATrait 
  | ExperienceDNATrait 
  | BehavioralDNATrait 
  | CommunicationDNATrait 
  | CulturalDNATrait;

// Job DNA Lifecycle Status
export type JobDNALifecycleStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'ai_training'
  | 'ai_trained'
  | 'active'
  | 'archived';

// DNA Change Record for Audit Trail
export interface DNAChangeRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'edited' | 'approved' | 'rejected' | 'archived';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  comment?: string;
}

// Job DNA Approval
export interface JobDNAApproval {
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approverRole?: string;
}

// DNA Quality Metrics
export interface DNAQualityMetrics {
  completenessScore: number; // 0-100
  balanceScore: number; // 0-100
  coverageByDimension: {
    skillDNA: number;
    experienceDNA: number;
    behavioralDNA: number;
    communicationDNA: number;
    culturalDNA: number;
  };
  warnings: DNAQualityWarning[];
  suggestions: string[];
}

export interface DNAQualityWarning {
  type: 'missing_traits' | 'imbalanced' | 'too_many_high' | 'incomplete_dimension';
  dimension?: DNADimension;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// Complete Job DNA Structure
export interface JobDNA {
  id: string;
  jobTitle: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: JobDNALifecycleStatus;
  approval: JobDNAApproval;
  culturalDNAEnabled: boolean;
  
  // DNA Dimensions
  skillDNA: SkillDNATrait[];
  experienceDNA: ExperienceDNATrait[];
  behavioralDNA: BehavioralDNATrait[];
  communicationDNA: CommunicationDNATrait[];
  culturalDNA: CulturalDNATrait[];
  
  // Metadata
  quality: DNAQualityMetrics;
  changeHistory: DNAChangeRecord[];
  
  // Source
  source: {
    type: 'upload' | 'linkedin' | 'manual' | 'template';
    originalFile?: string;
    linkedInUrl?: string;
    templateId?: string;
  };
}

// Interview Question with DNA Mapping
export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'situational' | 'communication';
  dnaMapping: {
    traitId: string;
    trait: string;
    dimension: DNADimension;
    importance: ImportanceLevel;
    signalsToEvaluate: string[];
  }[];
  estimatedDuration: number; // in seconds
  followUpQuestions?: string[];
  evaluationCriteria: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
}

// Candidate Evaluation per DNA Trait
export interface TraitEvaluation {
  traitId: string;
  trait: string;
  dimension: DNADimension;
  importance: ImportanceLevel;
  score: number; // 0-100
  evidence: string[];
  transcriptExcerpts?: {
    text: string;
    timestamp: string;
  }[];
  evaluatorNotes?: string;
}

// Dimension Evaluation Summary
export interface DimensionEvaluation {
  dimension: DNADimension;
  overallScore: number;
  traitEvaluations: TraitEvaluation[];
  strengths: string[];
  gaps: string[];
  impact: 'positive' | 'neutral' | 'negative';
}

// Explainable Recommendation
export interface ExplainableRecommendation {
  decision: 'Hire' | 'Hold' | 'Reject';
  confidence: number; // 0-100
  overallScore: number;
  dimensionEvaluations: {
    skillDNA: DimensionEvaluation;
    experienceDNA: DimensionEvaluation;
    behavioralDNA: DimensionEvaluation;
    communicationDNA: DimensionEvaluation;
    culturalDNA?: DimensionEvaluation;
  };
  summary: string;
  keyStrengths: string[];
  keyConcerns: string[];
  comparisonToOtherCandidates?: {
    percentile: number;
    totalCandidates: number;
  };
}

// Candidate with DNA Evaluation
export interface CandidateWithEvaluation {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  experience: string;
  status: 'resume_screened' | 'pending_interview' | 'interview_complete' | 'ai_analysis_ready' | 'decision_made';
  interviewDate?: string;
  interviewDuration?: string;
  jobDNAId: string;
  recommendation?: ExplainableRecommendation;
  finalDecision?: {
    decision: 'Hire' | 'Hold' | 'Reject';
    decidedBy: string;
    decidedAt: string;
    notes?: string;
  };
}

// Post-Hire Feedback
export interface PostHireFeedback {
  id: string;
  candidateId: string;
  jobDNAId: string;
  submittedBy: string;
  submittedAt: string;
  overallPerformance: 'exceeds' | 'meets' | 'below';
  traitAccuracy: {
    traitId: string;
    trait: string;
    dimension: DNADimension;
    predictedScore: number;
    actualPerformance: 'accurate' | 'overestimated' | 'underestimated';
    notes?: string;
  }[];
  suggestedDNARefinements: string[];
  wouldHireAgain: boolean;
}

// DNA Template
export interface DNATemplate {
  id: string;
  name: string;
  description: string;
  roleType: string;
  industry?: string;
  usageCount: number;
  rating: number;
  createdBy: string;
  jobDNA: Omit<JobDNA, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approval' | 'changeHistory'>;
}
