import { ProtectedLayout } from "components/layout/ProtectedLayout";

export default function ProtectedAppLayout({ children }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
