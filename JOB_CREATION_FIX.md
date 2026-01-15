# Job Creation Fix - January 14, 2026

## Issues Fixed

### 1. Missing Company Field Error
**Error**: `Job validation failed: company: Path 'company' is required.`

**Root Cause**: The User model didn't have a `companyId` field to reference the Company collection, so the job creation route couldn't fetch the company information.

**Solution**:
- Added `companyId` field to User model (ObjectId reference to Company)
- Updated User interface to include `companyId: mongoose.Types.ObjectId`
- Updated User schema to include the companyId field with Company reference

### 2. Model Overwrite Error
**Error**: `OverwriteModelError: Cannot overwrite 'User' model once compiled.`

**Root Cause**: The job routes were using dynamic imports (`await import()`) which caused Mongoose to try recompiling already-compiled models.

**Solution**:
- Changed User and Company model exports to use the pattern: `mongoose.models.X || mongoose.model()`
- Removed dynamic imports from job.routes.ts
- Added static imports at the top of the file

### 3. JobDNA Structure Mismatch
**Error**: `Cannot read properties of undefined (reading 'length')` in JobDNA.tsx

**Root Cause**: The backend Job model and AI service were generating a different structure than what the frontend expected:
- Backend had: `coreCompetencies`, `technicalSkills`, `softSkills`, etc.
- Frontend expected: `skillDNA`, `experienceDNA`, `behavioralDNA`, `communicationDNA`, `culturalDNA`

**Solution**:
- Updated Job model interface and schema to use the new DNA structure with trait objects
- Updated AI service to generate DNA in the correct format with id, name, description, importance, and signals
- Updated seed script to use the new structure
- Each DNA trait now includes:
  - `id`: unique identifier
  - `name`: trait name
  - `description`: brief description
  - `importance`: critical, high, medium, or low
  - `signals`: array of observable indicators

## Files Modified

1. **server/src/models/User.ts**
   - Added `companyId` field to interface and schema
   - Changed export pattern to prevent model overwrite

2. **server/src/models/Company.ts**
   - Changed export pattern to prevent model overwrite

3. **server/src/routes/job.routes.ts**
   - Removed dynamic imports
   - Added static imports for User and Company models

4. **server/src/routes/auth.routes.ts**
   - Updated registration to find or create Company
   - Associates new users with Company via companyId
   - Updated imports to use named exports

5. **server/src/models/Job.ts**
   - Completely restructured jobDNA field to match frontend expectations
   - Changed from simple string arrays to structured trait objects

6. **server/src/services/ai.service.ts**
   - Updated generateJobDNA to produce the new structure
   - Enhanced prompt to generate detailed trait objects with all required fields

7. **server/scripts/seed.ts**
   - Creates Company first
   - Associates admin user with Company via companyId
   - Updated sample job DNA to use new structure

## Testing

Database reseeded successfully with:
- 1 Company (Intelligens)
- 1 Admin user (admin@intelligens.app / Admin123!)
- 2 Sample jobs with properly structured DNA

## Next Steps

Users can now:
1. Register and automatically get associated with a company
2. Create jobs that automatically inherit the company name from their profile
3. Generate Job DNA that displays correctly in the frontend
4. View structured DNA traits with importance levels and observable signals
