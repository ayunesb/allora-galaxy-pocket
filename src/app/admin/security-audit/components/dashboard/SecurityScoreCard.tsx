
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SecurityScoreCardProps {
  score: number;
}

export function SecurityScoreCard({ score }: SecurityScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4ade80"; // green-500
    if (score >= 50) return "#facc15"; // yellow-500
    return "#f87171"; // red-400
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Overall Security Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-4">
          <div className="w-28 h-28">
            <CircularProgressbar
              value={score}
              text={`${score}%`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: getScoreColor(score),
                textColor: getScoreColor(score),
                trailColor: "#e5e7eb"
              })}
            />
          </div>
        </div>
        <div className="pt-2 text-center text-sm text-muted-foreground">
          {score >= 80 && "Good security posture"}
          {score >= 50 && score < 80 && "Moderate security risks"}
          {score < 50 && "Critical security issues detected"}
        </div>
      </CardContent>
    </Card>
  );
}
