import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import appCss from "../styles.css?url";
import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { restoreSessionThunk } from "@/store/slices/userSlice";
import { fetchBookingsThunk } from "@/store/slices/bookingsSlice";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SkyWings — Fly the world's finest" },
      { name: "description", content: "Search and book flights worldwide. Manage trips, choose seats, check in online, and get e-tickets instantly." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <Provider store={store}>
      <RootComponentInner />
    </Provider>
  );
}

function RootComponentInner() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSessionThunk()).then((result) => {
      if (restoreSessionThunk.fulfilled.match(result) && result.payload) {
        dispatch(fetchBookingsThunk());
      }
    });
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}