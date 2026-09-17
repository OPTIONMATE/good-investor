import AdminSignupForm from "../components/AdminSignupForm";

export const metadata = {
  title: "Admin Signup - Good Investor",
  description:
    "Create a secure admin account for Good Investor. OTP verification required.",
};

export default function AdminSignupPage() {
  return <AdminSignupForm />;
}
