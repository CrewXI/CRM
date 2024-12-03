const { execSync } = require('child_process');

try {
  // Get the current user's email
  const output = execSync('firebase auth:export --format=json').toString();
  const users = JSON.parse(output);
  
  const adminUser = users.find(user => user.email === 'chisholm@crewxi.com');
  
  if (adminUser) {
    console.log('Admin UID:', adminUser.localId);
  } else {
    console.log('Admin user not found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
