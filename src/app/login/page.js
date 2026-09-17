import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Login - trademilaan",
  description:
    "Login to your trademilaan account to access premium trading insights and services.",
};

export default function LoginPage() {
  return <AuthForm type="login" />;
}
