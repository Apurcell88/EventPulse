import { Navigate } from "react-router-dom";
import { User } from "../App";

interface AuthRedirectProps {
  user: User;
  children: React.ReactNode;
}

export default function AuthRedirect({ user, children }: AuthRedirectProps) {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
