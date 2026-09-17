import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Register - Good Investor",
  description:
    "Create your Good Investor account to access premium AI-powered trading insights and services.",
};

export default function RegisterPage() {
  return <AuthForm type="register" />;
}
