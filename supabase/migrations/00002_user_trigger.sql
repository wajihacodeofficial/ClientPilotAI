-- Create a trigger function that handles new signups in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_workspace_id uuid;
    username text;
BEGIN
    -- Extract a readable full name from user metadata or email prefix
    username := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

    -- Create a default workspace for the new user, owner points to auth.users.id
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (username || '''s Workspace', new.id)
    RETURNING id INTO new_workspace_id;

    -- Create a profile row for the user associated with the new workspace
    INSERT INTO public.profiles (id, workspace_id, role, full_name)
    VALUES (
        new.id,
        new_workspace_id,
        'admin',
        username
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to run after insert on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
