import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Brain, ArrowRight, Home } from "lucide-react";

interface SessionContinuePromptProps {
  pendingAreas: string[];
  completedAreas: string[];
  sessionDuration: number;
  currentRound: number;
  onContinue: () => void;
  onComplete: () => void;
}

const SessionContinuePrompt = ({
  pendingAreas,
  completedAreas,
  sessionDuration,
  currentRound,
  onContinue,
  onComplete
}: SessionContinuePromptProps) => {
  const getAreaDisplayName = (areaId: string): string => {
    const areaNames: { [key: string]: string } = {
      general: 'General Cognitive Wellness',
      attention: 'Attention',
      perception: 'Perception',
      memory: 'Memory',
      language: 'Language',
      executive: 'Executive Function',
      spatial: 'Spatial Reasoning',
      processing: 'Processing Speed',
      creativity: 'Creativity'
    };
    return areaNames[areaId] || areaId;
  };

  const sessionMinutes = Math.round(sessionDuration / 1000 / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-indigo-200 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-12 w-12 text-indigo-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                MindBloom
              </h1>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Great Progress! 🧠
          </CardTitle>
          <p className="text-gray-600 text-lg">
            You've completed Round {currentRound}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Progress Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Completed Areas */}
            <div className="space-y-3">
              <h3 className="font-semibold text-green-700 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Completed Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {completedAreas.map((area) => (
                  <Badge
                    key={area}
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    ✓ {getAreaDisplayName(area)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pending Areas */}
            <div className="space-y-3 text-right">
              <h3 className="font-semibold text-orange-700 flex items-center justify-end">
                <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 order-2"></div>
                <span className="order-1">Areas Yet to Practice</span>
              </h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {pendingAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="border-orange-200 text-orange-700"
                  >
                    {getAreaDisplayName(area)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <p className="text-gray-700 text-center">
              You have {10 - sessionMinutes} {(10 - sessionMinutes) === 1 ? 'minute' : 'minutes'} left and {pendingAreas.length} more {pendingAreas.length === 1 ? 'area' : 'areas'} - would you like to continue?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onContinue}
              size="lg"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-semibold py-3"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Yes, Continue Training
            </Button>
            
            <Button
              onClick={onComplete}
              variant="outline"
              size="lg"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3"
            >
              No, Complete Session
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SessionContinuePrompt;