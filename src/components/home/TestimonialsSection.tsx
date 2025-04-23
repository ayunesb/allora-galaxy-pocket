
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
    <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-4xl">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="p-6 bg-card rounded-lg border">
          <p className="text-muted-foreground italic">
            "{testimonial.quote}"
          </p>
          <p className="mt-2 text-sm font-medium">
            — {testimonial.author}
          </p>
        </div>
      ))}
    </div>
  );
};
