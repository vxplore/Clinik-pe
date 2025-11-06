import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import OnboardingForm from "./components/RegisterForm/OnboardingForm";
import OnboardingOtpForm from "./components/OtpForm/OnboardingOtpForm";
import OrganizationForm from "./components/OrganizationForm/OrganizationForm";
import SuccessMessage from "./components/SuccessFullMessage/SuccessMessage";
import LoginForm from "./components/LoginForm/LoginForm";

function AppContents() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />}>
        <Route index element={<OnboardingForm />} />
        <Route path="otp" element={<OnboardingOtpForm />} />
        <Route path="organization" element={<OrganizationForm />} />
        <Route path="success" element={<SuccessMessage />} />
        <Route path="login" element={<LoginForm />} />

      
      </Route>
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default AppContents;
