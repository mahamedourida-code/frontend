"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Heart, Sparkles, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to save review
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Thank you for your feedback!", {
      description: "Your review helps us improve Litt Up.",
    });

    setSubmitted(true);
    setIsSubmitting(false);

    // Sign out the user
    await signOut();

    // Redirect to homepage after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleSkip = async () => {
    // Sign out the user
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-2 border-border/50 bg-card/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          {!submitted ? (
            <>
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                See You Later! 👋
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                You've been successfully signed out. We'd love to hear about your experience!
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                Thank You! 💚
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Your feedback means the world to us. Redirecting you now...
              </CardDescription>
            </>
          )}
        </CardHeader>

        {!submitted ? (
          <CardContent className="space-y-6">
            {/* Rating Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">How was your experience?</Label>
              <div className="flex items-center justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all duration-200 hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 transition-colors",
                        (hoveredRating >= star || rating >= star)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {rating === 0 && "Click a star to rate"}
                {rating === 1 && "We're sorry to hear that"}
                {rating === 2 && "We can do better"}
                {rating === 3 && "Good to know!"}
                {rating === 4 && "Great! We're glad you enjoyed it"}
                {rating === 5 && "Awesome! Thank you so much!"}
              </p>
            </div>

            {/* Review Text Area */}
            <div className="space-y-3">
              <Label htmlFor="review" className="text-base font-semibold">
                Share your thoughts (optional)
              </Label>
              <Textarea
                id="review"
                placeholder="What did you like? What could we improve?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {review.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-border/50">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Want to continue using Litt Up?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href="/sign-in">
                    <Heart className="w-4 h-4 mr-2" />
                    Sign Back In
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-10 h-10 text-primary fill-primary" />
              </div>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Redirecting you to the homepage...
            </p>
            <div className="w-48 h-1 bg-muted rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-primary animate-[slideRight_2s_ease-in-out]" style={{
                animation: "slideRight 2s ease-in-out"
              }} />
            </div>
          </CardContent>
        )}
      </Card>

      <style jsx>{`
        @keyframes slideRight {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
