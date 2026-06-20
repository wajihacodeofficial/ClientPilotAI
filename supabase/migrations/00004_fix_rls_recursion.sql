-- Create security definer function to avoid RLS infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_workspace_id(user_id uuid)
RETURNS uuid AS $$
    SELECT workspace_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate policy for profiles to use the helper function
DROP POLICY IF EXISTS "Users can view profiles in their workspace" ON public.profiles;
CREATE POLICY "Users can view profiles in their workspace"
    ON public.profiles FOR SELECT
    USING (
        workspace_id = public.get_user_workspace_id(auth.uid())
    );
