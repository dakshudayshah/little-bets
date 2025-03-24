/**
 * @deprecated This component is deprecated. Please use the Home page component instead.
 * The Home page provides an improved mobile-friendly interface and better performance.
 * File will be removed in a future update.
 */

import { Navigate } from 'react-router-dom';

export const AllBets = () => {
  // Redirect to Home page
  return <Navigate to="/" replace />;
}; 