-- Progress records scale adjustment
-- Run this in Supabase SQL editor to allow 0-100 values in progress metrics

DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT con.constraint_name
        FROM information_schema.constraint_column_usage ccu
        JOIN information_schema.table_constraints con
          ON con.constraint_name = ccu.constraint_name
        WHERE con.table_name = 'progress_records'
          AND con.constraint_type = 'CHECK'
          AND ccu.column_name IN ('emotional_clarity', 'mental_clarity', 'centeredness')
    LOOP
        EXECUTE format('ALTER TABLE progress_records DROP CONSTRAINT %I;', constraint_name);
    END LOOP;

    ALTER TABLE progress_records
        ADD CONSTRAINT progress_emotional_clarity_check CHECK (emotional_clarity >= 0 AND emotional_clarity <= 100),
        ADD CONSTRAINT progress_mental_clarity_check CHECK (mental_clarity >= 0 AND mental_clarity <= 100),
        ADD CONSTRAINT progress_centeredness_check CHECK (centeredness >= 0 AND centeredness <= 100);
END $$;

RAISE NOTICE 'Progress metrics now accept 0-100 values.';
