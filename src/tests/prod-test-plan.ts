// This is a guide for manual testing in production

const PROD_TEST_PLAN = {
  preDeployment: [
    'Verify Supabase production credentials',
    'Check Google OAuth redirect URIs include production URL',
    'Verify database indexes are created in production',
  ],
  
  authTesting: [
    'Test Google sign-in from homepage',
    'Test Google sign-in from Create Bet page',
    'Test Google sign-in from Prediction form',
    'Verify session persistence after refresh',
    'Test sign-out functionality',
  ],
  
  profileTesting: [
    'Create new bet while signed in',
    'Make prediction on existing bet',
    'Visit profile page',
    'Verify both bet and prediction appear',
    'Test all navigation links',
    'Verify mobile responsiveness',
  ],
  
  errorHandling: [
    'Test invalid route handling',
    'Test unauthorized access to profile',
    'Test network error handling',
    'Test form validation errors',
  ]
}; 