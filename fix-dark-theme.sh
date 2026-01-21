#!/bin/bash

# Script to replace hardcoded colors with CSS variables for dark theme support

echo "🎨 Replacing hardcoded colors with CSS variables..."

# Define the pages to update
PAGES=(
  "src/pages/FinalDecision.tsx"
  "src/pages/AnalysisReport.tsx"
  "src/pages/SendInvitation.tsx"
  "src/pages/Dashboard.tsx"
  "src/pages/Reports.tsx"
  "src/pages/Candidates.tsx"
  "src/pages/InterviewBuilder.tsx"
  "src/pages/EditProfile.tsx"
  "src/pages/VideoInterview.tsx"
  "src/pages/AITraining.tsx"
  "src/pages/InterviewComplete.tsx"
  "src/pages/Login.tsx"
  "src/pages/Signup.tsx"
  "src/pages/Onboarding.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "  📄 Updating $page..."
    
    # Replace background: 'white' with background: 'var(--white)'
    sed -i "s/background: 'white'/background: 'var(--white)'/g" "$page"
    
    # Replace background: '#FFFFFF' with background: 'var(--white)'
    sed -i "s/background: '#FFFFFF'/background: 'var(--white)'/g" "$page"
    
    # Replace background: '#ffffff' with background: 'var(--white)'
    sed -i "s/background: '#ffffff'/background: 'var(--white)'/g" "$page"
    
    # Replace color: '#111827' with color: 'var(--gray-900)'
    sed -i "s/color: '#111827'/color: 'var(--gray-900)'/g" "$page"
    
    # Replace color: '#1F2937' with color: 'var(--gray-800)'
    sed -i "s/color: '#1F2937'/color: 'var(--gray-800)'/g" "$page"
    
    # Replace color: '#1f2937' with color: 'var(--gray-800)'
    sed -i "s/color: '#1f2937'/color: 'var(--gray-800)'/g" "$page"
    
    # Replace color: '#6B7280' with color: 'var(--gray-500)'
    sed -i "s/color: '#6B7280'/color: 'var(--gray-500)'/g" "$page"
    
    # Replace color: '#6b7280' with color: 'var(--gray-500)'
    sed -i "s/color: '#6b7280'/color: 'var(--gray-500)'/g" "$page"
    
    # Replace color: '#374151' with color: 'var(--gray-700)'
    sed -i "s/color: '#374151'/color: 'var(--gray-700)'/g" "$page"
    
    # Replace color: '#4B5563' with color: 'var(--gray-600)'
    sed -i "s/color: '#4B5563'/color: 'var(--gray-600)'/g" "$page"
    
    # Replace color: '#4b5563' with color: 'var(--gray-600)'
    sed -i "s/color: '#4b5563'/color: 'var(--gray-600)'/g" "$page"
    
  fi
done

echo "✅ Color replacement complete!"
