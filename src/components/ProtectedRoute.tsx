interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Auth temporarily disabled: always allow access
  return <>{children}</>;
}
