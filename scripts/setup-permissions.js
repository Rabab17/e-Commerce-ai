'use strict';

/**
 * Setup permissions for e-commerce API
 */

async function setupPermissions() {
  try {
    console.log('Setting up permissions...');

    // Get all roles
    const roles = await strapi.query('plugin::users-permissions.role').findMany();
    console.log('Available roles:', roles.map(r => ({ id: r.id, name: r.name, type: r.type })));

    // Find authenticated role
    const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' }
    });

    if (!authenticatedRole) {
      console.log('Creating authenticated role...');
      await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Authenticated',
          type: 'authenticated',
          description: 'Default role for authenticated users'
        }
      });
    }

    // Find public role
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' }
    });

    if (!publicRole) {
      console.log('Creating public role...');
      await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Public',
          type: 'public',
          description: 'Default role for public users'
        }
      });
    }

    // Setup permissions for each API
    const apis = [
      'product',
      'category', 
      'brand',
      'cart',
      'order',
      'review',
      'address',
      'about',
      'global'
    ];

    const actions = ['find', 'findOne', 'create', 'update', 'delete'];

    for (const api of apis) {
      console.log(`Setting up permissions for ${api}...`);
      
      // Public permissions (read-only)
      await setPermissionsForRole('public', api, ['find', 'findOne']);
      
      // Authenticated permissions (full access)
      await setPermissionsForRole('authenticated', api, actions);
    }

    console.log('Permissions setup completed successfully!');
  } catch (error) {
    console.error('Error setting up permissions:', error);
  }
}

async function setPermissionsForRole(roleType, api, actions) {
  try {
    const role = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: roleType }
    });

    if (!role) {
      console.log(`Role ${roleType} not found`);
      return;
    }

    for (const action of actions) {
      const actionName = `api::${api}.${api}.${action}`;
      
      // Check if permission already exists
      const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
        where: {
          action: actionName,
          role: role.id
        }
      });

      if (!existingPermission) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: actionName,
            role: role.id
          }
        });
        console.log(`Created permission: ${actionName} for ${roleType}`);
      } else {
        console.log(`Permission already exists: ${actionName} for ${roleType}`);
      }
    }
  } catch (error) {
    console.error(`Error setting permissions for ${roleType} ${api}:`, error);
  }
}

async function createAdminRole() {
  try {
    console.log('Creating admin role...');
    
    // Check if admin role exists
    const existingAdminRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { name: 'Admin' }
    });

    if (existingAdminRole) {
      console.log('Admin role already exists');
      return existingAdminRole;
    }

    // Create admin role
    const adminRole = await strapi.query('plugin::users-permissions.role').create({
      data: {
        name: 'Admin',
        type: 'authenticated',
        description: 'Administrator role with full access'
      }
    });

    // Give admin role all permissions
    const apis = ['product', 'category', 'brand', 'cart', 'order', 'review', 'address', 'about', 'global'];
    const actions = ['find', 'findOne', 'create', 'update', 'delete'];

    for (const api of apis) {
      for (const action of actions) {
        const actionName = `api::${api}.${api}.${action}`;
        
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: actionName,
            role: adminRole.id
          }
        });
      }
    }

    console.log('Admin role created with full permissions');
    return adminRole;
  } catch (error) {
    console.error('Error creating admin role:', error);
  }
}

async function assignAdminRoleToUser(userId) {
  try {
    const adminRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.log('Admin role not found');
      return;
    }

    await strapi.query('plugin::users-permissions.user').update({
      where: { id: userId },
      data: { role: adminRole.id }
    });

    console.log(`Admin role assigned to user ${userId}`);
  } catch (error) {
    console.error('Error assigning admin role:', error);
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await setupPermissions();
  await createAdminRole();
  
  // Uncomment and set user ID to assign admin role to specific user
  // await assignAdminRoleToUser(1);

  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
