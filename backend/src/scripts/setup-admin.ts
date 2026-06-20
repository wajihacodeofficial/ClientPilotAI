import { supabaseAdmin } from '../lib/supabase';

async function main() {
  console.log('Running Supabase admin setup script...');
  
  // 1. Provision Admin User
  const adminEmail = 'admin@clientpilotai.com';
  const adminPassword = 'Client@123';
  
  console.log(`Checking if admin user ${adminEmail} exists...`);
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }
  
  let adminUser = users.find(u => u.email?.toLowerCase() === adminEmail);
  
  if (!adminUser) {
    console.log(`Admin user does not exist. Creating...`);
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'System Admin' }
    });
    
    if (createError) {
      console.error('Failed to create admin user:', createError.message);
      process.exit(1);
    }
    
    adminUser = createData.user;
    console.log(`Admin user created successfully with ID: ${adminUser?.id}`);
  } else {
    console.log(`Admin user exists. Updating password...`);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      password: adminPassword,
      email_confirm: true
    });
    
    if (updateError) {
      console.error('Failed to update admin user password:', updateError.message);
      process.exit(1);
    }
    console.log(`Admin user password updated successfully.`);
  }
  
  const currentAdminUser = adminUser!;
  
  // Make sure the admin profile role is 'admin'
  console.log(`Ensuring profile role is 'admin' for admin user...`);
  const { error: profileGetError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', currentAdminUser.id)
    .single();
    
  if (profileGetError) {
    console.log(`Profile not found for admin. Creating profile...`);
    const { data: ws, error: wsError } = await supabaseAdmin
      .from('workspaces')
      .insert({
        name: "Admin's Workspace",
        owner_id: currentAdminUser.id
      })
      .select('id')
      .single();
      
    if (wsError) {
      console.error('Failed to create admin workspace:', wsError.message);
    } else {
      const { error: profileCreateError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: currentAdminUser.id,
          workspace_id: ws.id,
          role: 'admin',
          full_name: 'System Admin'
        });
        
      if (profileCreateError) {
        console.error('Failed to create admin profile:', profileCreateError.message);
      } else {
        console.log('Admin workspace and profile created successfully.');
      }
    }
  } else {
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin', full_name: 'System Admin' })
      .eq('id', currentAdminUser.id);
      
    if (profileUpdateError) {
      console.error('Failed to update admin profile role to admin:', profileUpdateError.message);
    } else {
      console.log('Admin profile role is set to admin.');
    }
  }
  
  // 2. Provision Demo Standard User
  const demoEmail = 'user@clientpilotai.com';
  const demoPassword = 'User@123';
  
  console.log(`Checking if standard user ${demoEmail} exists...`);
  let demoUser = users.find(u => u.email?.toLowerCase() === demoEmail);
  
  if (!demoUser) {
    console.log(`Standard user does not exist. Creating...`);
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: 'John Doe' }
    });
    
    if (createError) {
      console.error('Failed to create standard user:', createError.message);
    } else {
      demoUser = createData.user;
      console.log(`Standard user created successfully with ID: ${demoUser?.id}`);
    }
  } else {
    console.log(`Standard user exists. Updating password...`);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(demoUser.id, {
      password: demoPassword,
      email_confirm: true
    });
    
    if (updateError) {
      console.error('Failed to update standard user password:', updateError.message);
    } else {
      console.log(`Standard user password updated successfully.`);
    }
  }
  
  if (demoUser) {
    const currentDemoUser = demoUser;
    console.log(`Ensuring profile role is 'user' for standard user...`);
    const { error: demoProfileGetError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', currentDemoUser.id)
      .single();
      
    if (demoProfileGetError) {
      console.log(`Profile not found for standard user. Creating...`);
      const { data: ws, error: wsError } = await supabaseAdmin
        .from('workspaces')
        .insert({
          name: "John Doe's Workspace",
          owner_id: currentDemoUser.id
        })
        .select('id')
        .single();
        
      if (wsError) {
        console.error('Failed to create standard workspace:', wsError.message);
      } else {
        const { error: profileCreateError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: currentDemoUser.id,
            workspace_id: ws.id,
            role: 'user',
            full_name: 'John Doe'
          });
          
        if (profileCreateError) {
          console.error('Failed to create standard profile:', profileCreateError.message);
        } else {
          console.log('Standard workspace and profile created successfully.');
        }
      }
    } else {
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'user', full_name: 'John Doe' })
        .eq('id', currentDemoUser.id);
        
      if (profileUpdateError) {
        console.error('Failed to update standard profile role to user:', profileUpdateError.message);
      } else {
        console.log('Standard profile role is set to user.');
      }
    }
  }
  
  console.log('Admin and standard user setup completed successfully.');
}

main().catch(console.error);
