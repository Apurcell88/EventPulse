import { Navigate } from "react-router-dom";
import { User } from "../App";

interface ProtectedRouteProps {
  user: User;
  children: React.ReactNode;
}

export default function ProtectedRoute({
  user,
  children,
}: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
