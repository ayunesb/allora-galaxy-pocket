
import LegalLayout from "@/components/layouts/LegalLayout";

export default function AIDisclosure() {
  return (
    <LegalLayout title="AI Usage Terms">
      <p className="text-sm text-muted-foreground mb-4">
        Effective Date: August 14, 2023
      </p>
      
      <div className="space-y-4">
        <p>
          Allora OS uses advanced AI models to generate strategies, content, and recommendations. 
          These terms explain how AI input/output is handled, your rights to the data, and 
          restrictions on AI misuse.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Outputs may contain inaccuracies. AI use is governed by OpenAI and other provider guidelines. 
          Outputs should be reviewed before public distribution.
        </p>
      </div>
    </LegalLayout>
  );
}
