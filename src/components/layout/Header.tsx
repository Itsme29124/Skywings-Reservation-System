import { Link, useNavigate } from "@tanstack/react-router";
import { Plane, User, LogOut, Ticket, ShieldCheck } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { logout } from "@/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function Header() {
  const user = useAppSelector((s) => s.user.current);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-hero shadow-glow transition-smooth group-hover:scale-105">
            <Plane className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-display text-xl tracking-tight">SkyWings</div>
            <div className="text-[9px] text-gold tracking-[0.25em] uppercase font-semibold mt-0.5">Fly Better</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Search</Link>
          <Link to="/trips" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth" activeProps={{ className: "text-foreground" }}>My Trips</Link>
          <Link to="/check-in" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth" activeProps={{ className: "text-foreground" }}>Check-in</Link>
          {user?.isAdmin && <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth" activeProps={{ className: "text-foreground" }}>Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-card">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm">{user.fullName.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => nav({ to: "/trips" })}>
                  <Ticket className="mr-2 h-4 w-4" /> My Trips
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem onClick={() => nav({ to: "/admin" })}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { dispatch(logout()); nav({ to: "/" }); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={() => nav({ to: "/login", search: { tab: "signin" } })} variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" /> Sign in
              </Button>
              <Button onClick={() => nav({ to: "/login", search: { tab: "signup" } })} size="sm" className="bg-gradient-hero shadow-elegant">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
