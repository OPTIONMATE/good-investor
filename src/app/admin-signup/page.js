import AdminSignupForm from "../components/AdminSignupForm";

export const metadata = {
  title: "Admin Signup - trademilaan",
  description:
    "Create a secure admin account for trademilaan. OTP verification required.",
};

export default function AdminSignupPage() {
  return <AdminSignupForm />;
}
