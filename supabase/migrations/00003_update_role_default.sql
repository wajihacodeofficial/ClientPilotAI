-- Alter the profiles table to default role to 'user'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

-- Update the trigger function to dynamically assign roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_workspace_id uuid;
    username text;
    user_role text;
BEGIN
    username := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    
    -- Assign 'admin' role if email matches admin email, else 'user'
    IF LOWER(new.email) = 'admin@clientpilotai.com' THEN
        user_role := 'admin';
    ELSE
        user_role := 'user';
    END IF;

    -- Create a default workspace
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (username || '''s Workspace', new.id)
    RETURNING id INTO new_workspace_id;

    -- Create profile
    INSERT INTO public.profiles (id, workspace_id, role, full_name)
    VALUES (
        new.id,
        new_workspace_id,
        user_role,
        username
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
