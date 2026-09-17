import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Login - Good Investor",
  description:
    "Login to your Good Investor account to access premium trading insights and services.",
};

export default function LoginPage() {
  return <AuthForm type="login" />;
}
