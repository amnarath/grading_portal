/*
  # Add missing batch_number column to grading_entries

  This migration ensures the batch_number column exists in the grading_entries table.
  This is a safety migration in case the column was accidentally removed or never created.
*/

-- Add batch_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'grading_entries' 
    AND column_name = 'batch_number'
  ) THEN
    ALTER TABLE grading_entries ADD COLUMN batch_number text;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'grading_entries_batch_number_key'
  ) THEN
    ALTER TABLE grading_entries ADD CONSTRAINT grading_entries_batch_number_key UNIQUE (batch_number);
  END IF;
END $$; 