/**
 * Admin Setup Script for OnboardTicket
 *
 * This script helps you create admin accounts quickly
 * Run with: node setup-admin.js
 */

const BASE_URL = "http://localhost:8080";

// Default admin accounts to create
const adminAccounts = [
  {
    email: "admin@onboardticket.com",
    password: "Admin123!",
    firstName: "Admin",
    lastName: "User",
    title: "Mr",
  },
  {
    email: "adebayo@onboardticket.com",
    password: "Adebayo123!",
    firstName: "Adebayo",
    lastName: "Toheeb",
    title: "Mr",
  },
];

async function createAdminAccount(adminData) {
  try {
    console.log(`\n🔐 Creating admin account: ${adminData.email}`);

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Admin account created successfully!`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   User ID: ${result.user?.id}`);

      // Send verification email
      try {
        const verificationResponse = await fetch(
          `${BASE_URL}/api/auth/send-verification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: adminData.email,
              userId: result.user?.id,
              userName: adminData.firstName,
            }),
          },
        );

        const verificationResult = await verificationResponse.json();
        if (verificationResult.success) {
          console.log(`📧 Verification email sent`);
        }
      } catch (error) {
        console.log(`⚠️  Verification email failed (account still created)`);
      }

      return true;
    } else {
      if (result.message && result.message.includes("already exists")) {
        console.log(`ℹ️  Admin account already exists: ${adminData.email}`);
        return true;
      } else {
        console.log(`❌ Failed to create admin account: ${result.message}`);
        return false;
      }
    }
  } catch (error) {
    console.log(`❌ Error creating admin account: ${error.message}`);
    return false;
  }
}

async function testAdminLogin(email, password) {
  try {
    console.log(`\n🧪 Testing admin login: ${email}`);

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success && result.token) {
      console.log(`✅ Admin login successful!`);

      // Test admin dashboard access
      const dashboardResponse = await fetch(`${BASE_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${result.token}`,
        },
      });

      const dashboardResult = await dashboardResponse.json();

      if (dashboardResponse.ok) {
        console.log(`✅ Admin dashboard access confirmed`);
        console.log(`   Total bookings: ${dashboardResult.totalBookings || 0}`);
        console.log(`   Total revenue: $${dashboardResult.totalRevenue || 0}`);
      } else {
        console.log(`❌ Admin dashboard access failed`);
      }

      return true;
    } else {
      console.log(`❌ Admin login failed: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing admin login: ${error.message}`);
    return false;
  }
}

async function setupAdminAccounts() {
  console.log("🚀 OnboardTicket Admin Setup");
  console.log("==============================\n");

  // Check if server is running
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/ping`);
    if (!healthResponse.ok) {
      throw new Error("Server not responding");
    }
    console.log("✅ Server is running\n");
  } catch (error) {
    console.log("❌ Server is not running. Please start the dev server first:");
    console.log("   npm run dev\n");
    return;
  }

  let successCount = 0;

  for (const admin of adminAccounts) {
    const success = await createAdminAccount(admin);
    if (success) {
      successCount++;

      // Test the login
      await testAdminLogin(admin.email, admin.password);
    }
  }

  console.log("\n📊 Setup Summary:");
  console.log(
    `   ${successCount}/${adminAccounts.length} admin accounts ready`,
  );

  if (successCount > 0) {
    console.log("\n🎉 Admin setup complete!");
    console.log("\nAdmin Credentials:");
    adminAccounts.forEach((admin) => {
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log("");
    });

    console.log("🌐 Access URLs:");
    console.log(`   Admin Dashboard: ${BASE_URL}/admin`);
    console.log(`   Login Page: ${BASE_URL}/login`);
    console.log(`   Registration: ${BASE_URL}/register`);
  } else {
    console.log("\n❌ No admin accounts were created successfully");
  }
}

// Custom admin account creation
async function createCustomAdmin(email, password, firstName, lastName) {
  const customAdmin = {
    email,
    password,
    firstName,
    lastName,
    title: "Mr",
  };

  console.log("\n🔧 Creating custom admin account...");
  const success = await createAdminAccount(customAdmin);

  if (success) {
    await testAdminLogin(email, password);
    console.log("\n✅ Custom admin account ready!");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 4) {
    // Custom admin: node setup-admin.js email password firstName lastName
    const [email, password, firstName, lastName] = args;
    createCustomAdmin(email, password, firstName, lastName).catch(
      console.error,
    );
  } else {
    // Default setup
    setupAdminAccounts().catch(console.error);
  }
}

module.exports = { createAdminAccount, testAdminLogin, setupAdminAccounts };
