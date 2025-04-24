
export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Allora OS replaced 5 tools and 2 consultants in my agency.",
      author: "Sarah K., Agency Owner"
    },
    {
      quote: "It's like having a growth team that never sleeps.",
      author: "Mike R., E-commerce Founder"
    }
  ];

  return (
    <div className="mt-12 md:mt-16 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto px-4 md:px-0">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="p-4 md:p-6 bg-card rounded-lg border">
          <p className="text-muted-foreground italic">
            "{testimonial.quote}"
          </p>
          <p className="mt-3 text-sm font-medium">
            — {testimonial.author}
          </p>
        </div>
      ))}
    </div>
  );
};
