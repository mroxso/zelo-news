import { useSeoMeta } from "@unhead/react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useSeoMeta({
    title: "404 - Page Not Found",
    description: "The page you are looking for could not be found. Return to the home page to continue browsing.",
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
          <Card className="max-w-2xl w-full border-dashed">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <span className="text-3xl font-bold text-muted-foreground">404</span>
              </div>
              <CardTitle className="text-3xl">Page Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground text-lg">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
