import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Phone,
  Briefcase,
  ChevronDown,
} from "lucide-react";

import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";

const countryOptions = [
  {
    label: "Australia (+61)",
    value: "+61",
  },
  {
    label: "Pakistan (+92)",
    value: "+92",
  },
  {
    label: "United States (+1)",
    value: "+1",
  },
  {
    label: "United Kingdom (+44)",
    value: "+44",
  },
  {
    label: "UAE (+971)",
    value: "+971",
  },
];

const applicationOptions = [
  {
    label: "Individual",
    value: "individual",
  },
  {
    label: "Joint",
    value: "joint",
  },
  {
    label: "Company",
    value: "company",
  },
  {
    label: "Trust",
    value: "trust",
  },
  {
    label: "SMSF",
    value: "smsf",
  },
];
export function SignUp() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+61");

  const [applicationType, setApplicationType] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/onboarding");
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          Create your account
        </h2>

        <p className="mt-2 text-muted">
          Join Caprock and begin your journey toward smarter investing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Doe"
          icon={<User className="h-4 w-4" />}
          required
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />

        <div className="grid gap-5 md:grid-cols-[150px_1fr]">
          <Select
            label="Country"
            options={countryOptions}
            value={countryCode}
            onChange={setCountryCode}
          />

          <Input
            label="Mobile number"
            type="tel"
            placeholder="412 345 678"
            icon={<Phone className="h-4 w-4" />}
            required
          />
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          icon={<Lock className="h-4 w-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-500">Passwords do not match.</p>
        )}
        <Select
          label="Application type"
          placeholder="Select application type"
          icon={<Briefcase className="h-4 w-4" />}
          options={applicationOptions}
          value={applicationType}
          onChange={setApplicationType}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs leading-relaxed text-muted">
            By creating an account, you agree to our
            <span className="mx-1 cursor-pointer font-medium text-caprock underline">
              Terms of Service
            </span>
            and
            <span className="ml-1 cursor-pointer font-medium text-caprock underline">
              Privacy Policy.
            </span>
          </p>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
          icon={<ArrowRight className="h-4 w-4" />}
        >
          Get started
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?
        <Link
          to="/login"
          className="ml-1 font-semibold text-caprock transition-colors hover:text-caprock-light"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
