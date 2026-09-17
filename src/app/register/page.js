import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Register - trademilaan",
  description:
    "Create your trademilaan account to access premium AI-powered trading insights and services.",
};

export default function RegisterPage() {
  return <AuthForm type="register" />;
}
