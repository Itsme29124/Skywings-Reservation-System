import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { signinThunk, signupThunk } from "@/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Loader2 } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
  tab: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in or Sign up — SkyWings" }] }),
});

function AuthPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { redirect, tab } = Route.useSearch();
  const user = useAppSelector((s) => s.user.current);
  const [loading, setLoading] = useState(false);

  // Sign in state
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign up state
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  if (user) {
    // Already logged in
    setTimeout(() => nav({ to: redirect || "/" }), 0);
  }

  const handleSignIn = async (e: React.SyntheticEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await dispatch(signinThunk({ email: siEmail.trim(), password: siPassword }));
    if (signinThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.fullName.split(" ")[0]}!`);
      nav({ to: redirect || "/" });
    } else {
      toast.error((result.error as Error).message ?? "Sign in failed.");
    }
  } finally { setLoading(false); }
};

  const handleSignUp = async (e: React.SyntheticEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    if (suPassword.length < 6) throw new Error("Password must be at least 6 characters.");
    if (!suName.trim()) throw new Error("Full name is required.");
    const result = await dispatch(signupThunk({ email: suEmail.trim(), password: suPassword, fullName: suName.trim() }));
    if (signupThunk.fulfilled.match(result)) {
      toast.success("Account created. Welcome aboard!");
      nav({ to: redirect || "/" });
    } else {
      toast.error((result.error as Error).message ?? "Signup failed.");
    }
  } catch (err) {
    toast.error((err as Error).message);
  } finally { setLoading(false); }
};

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:block bg-gradient-crimson relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.55_0.21_25/0.6),transparent_70%)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
              <Plane className="h-5 w-5 text-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl">SkyWings</span>
          </Link>
          <div>
            <h2 className="font-display text-5xl leading-tight mb-4">Fly with the world's finest.</h2>
            <p className="text-lg opacity-90 max-w-md">Curated journeys, refined cabins, and impeccable service across 200+ destinations.</p>
          </div>
          <div className="flex gap-2">
            <span className="h-1 w-8 rounded bg-gold" />
            <span className="h-1 w-8 rounded bg-white/30" />
            <span className="h-1 w-8 rounded bg-white/30" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl mb-2">Welcome</h1>
          <p className="text-muted-foreground mb-8">Sign in or create an account to manage your trips.</p>

          <Tabs defaultValue={tab || "signin"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required value={siEmail} onChange={(e) => setSiEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="si-pass">Password</Label>
                  <Input id="si-pass" type="password" required value={siPassword} onChange={(e) => setSiPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-hero shadow-elegant h-11">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
                <p className="text-xs text-muted-foreground text-center">Tip: use <span className="font-mono">admin@skywings.com</span> with any password (after signup) for admin access.</p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" required value={suName} onChange={(e) => setSuName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={suEmail} onChange={(e) => setSuEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="su-pass">Password</Label>
                  <Input id="su-pass" type="password" required minLength={6} value={suPassword} onChange={(e) => setSuPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-hero shadow-elegant h-11">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
