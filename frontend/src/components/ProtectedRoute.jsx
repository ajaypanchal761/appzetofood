import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUserRole, hasModuleAccess } from "@/lib/utils/auth";

/**
 * Role-based Protected Route Component
 * Only allows access if user has the correct role for the module
 */
export default function ProtectedRoute({ children, requiredRole, loginPath }) {
  const location = useLocation();
  const currentRole = getCurrentUserRole();

  // If no token or role, redirect to login
  if (!currentRole) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  // Check if user has access to this module
  if (requiredRole && !hasModuleAccess(currentRole, requiredRole)) {
    // User is logged in but with wrong role, redirect to appropriate login
    const roleLoginPaths = {
      'admin': '/admin/login',
      'restaurant': '/restaurant/login',
      'delivery': '/delivery/login',
      'user': '/user/auth/sign-in'
    };
    
    const redirectPath = roleLoginPaths[currentRole] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

