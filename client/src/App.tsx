import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import Products from "@/pages/Products";
import Admin from "@/pages/Admin";
import LoginPage from "@/pages/login-page";
// import LiveChat from "@/components/LiveChat";
import LiveChatComponent from "@/components/ui/LiveChatComponent";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

// Analytics tracking
function PageTracker() {
  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        await apiRequest('/api/analytics/pageview', {
          method: 'POST',
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent || null
          })
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };
    
    trackPageView();
  }, [window.location.pathname]);
  
  return null;
}

function Router() {
  return (
    <>
      <PageTracker />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog/:slug?" component={Blog} />
        <Route path="/products/:slug?" component={Products} />
        <Route path="/admin" component={Admin} />
        <Route path="/login" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <LiveChatComponent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
