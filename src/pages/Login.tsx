import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
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
          Welcome back
        </h2>
        <p className="mt-2 text-muted">Sign in to continue to your portfolio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-border bg-white accent-caprock"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-caprock hover:text-caprock-light transition-colors font-medium"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
          icon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-caprock hover:text-caprock-light transition-colors"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
