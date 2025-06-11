-- Rollback Migration: Drop quiz_questions table
-- Description: Safely removes the quiz_questions table and all related components
-- Created: 2024

-- Drop RLS policies first
DROP POLICY IF EXISTS "Allow full access to quiz_questions for authenticated users" ON quiz_questions;
DROP POLICY IF EXISTS "Allow read access to quiz_questions for anonymous users" ON quiz_questions;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_quiz_questions_updated_at ON quiz_questions;

-- Drop function
DROP FUNCTION IF EXISTS update_quiz_questions_updated_at();

-- Drop indexes (they will be dropped automatically with the table, but explicit is better)
DROP INDEX IF EXISTS idx_quiz_questions_document_id;
DROP INDEX IF EXISTS idx_quiz_questions_created_at;

-- Drop the table (this will also drop all constraints)
DROP TABLE IF EXISTS quiz_questions;

-- Confirm rollback
-- SELECT 'quiz_questions table and related components have been successfully removed' AS rollback_status; 