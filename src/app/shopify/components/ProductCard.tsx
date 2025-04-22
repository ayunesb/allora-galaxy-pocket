
import { Card, CardContent } from "@/components/ui/card";

interface SeoData {
  title: string;
  tags: string[];
}

interface Product {
  name: string;
  description: string;
  seo: SeoData;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.description}</p>

        <div className="text-xs">
          <p className="text-muted-foreground">SEO Tags:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            {product.seo.tags.map((tag, i) => <li key={i}>{tag}</li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
