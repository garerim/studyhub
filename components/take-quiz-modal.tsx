"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Confetti } from "@/components/ui/confetti";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

type Question = {
  id: string;
  question: string;
  type: string;
  points: number;
  order?: number;
  answers: {
    id: string;
    text: string;
    isCorrect: boolean;
    order?: number;
  }[];
};

type Quiz = {
  id: string;
  name: string;
  description: string | null;
  questions: Question[];
};

type PreviousAttempt = {
  id: string;
  score: number;
  totalPoints: number;
  completedAt: string;
  answers: string; // JSON string
};

type TakeQuizModalProps = {
  userId: string;
  matiereId: string;
  quiz: Quiz;
  previousAttempt?: PreviousAttempt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

export function TakeQuizModal({
  userId,
  matiereId,
  quiz,
  previousAttempt,
  open,
  onOpenChange,
  onCompleted,
}: TakeQuizModalProps) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    score: number;
    totalPoints: number;
    percentage: number;
  } | null>(null);
  const [showResults, setShowResults] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [isShowingPreviousAttempt, setIsShowingPreviousAttempt] = React.useState(false);
  const [revealedAnswers, setRevealedAnswers] = React.useState<Set<string>>(new Set());

  // Initialiser avec la tentative précédente si elle existe
  React.useEffect(() => {
    if (open && previousAttempt) {
      try {
        const previousAnswers = JSON.parse(previousAttempt.answers);
        setAnswers(previousAnswers);
        setResult({
          score: previousAttempt.score,
          totalPoints: previousAttempt.totalPoints,
          percentage: Math.round((previousAttempt.score / previousAttempt.totalPoints) * 100),
        });
        setIsShowingPreviousAttempt(true);
        setShowResults(true);
      } catch (error) {
        console.error("Error parsing previous attempt:", error);
      }
    } else if (open && !previousAttempt) {
      // Réinitialiser si pas de tentative précédente
      setAnswers({});
      setCurrentQuestionIndex(0);
      setResult(null);
      setShowResults(false);
      setIsShowingPreviousAttempt(false);
    }
  }, [open, previousAttempt]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/quizes/${quiz.id}/attempts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }
      const data = await response.json();
      setResult(data);
      setShowResults(true);
      setIsShowingPreviousAttempt(false); // Ce n'est plus une tentative précédente
      // Afficher les confettis si le score est bon (>= 80%)
      if (data.percentage >= 80) {
        setShowConfetti(true);
        // Arrêter les confettis après 3 secondes
        setTimeout(() => setShowConfetti(false), 3000);
      }
      // Ne pas appeler onCompleted ici pour garder le modal ouvert
      // onCompleted sera appelé quand l'utilisateur ferme le modal
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setShowResults(false);
    setShowConfetti(false);
    setIsShowingPreviousAttempt(false);
    setRevealedAnswers(new Set());
  };

  const handleRevealAnswer = (questionId: string) => {
    setRevealedAnswers((prev) => new Set(prev).add(questionId));
  };

  const handleClose = () => {
    // Appeler onCompleted seulement quand on ferme le modal avec des résultats
    if (showResults && result && !isShowingPreviousAttempt) {
      onCompleted?.();
    }
    onOpenChange(false);
    handleRestart();
  };

  if (showResults && result) {
    const isGoodScore = result.percentage >= 80;
    const isExcellentScore = result.percentage >= 90;

    return (
      <>
        <Confetti show={showConfetti} intensity={isExcellentScore ? 100 : 70} />
        <Dialog open={open} onOpenChange={(isOpen) => {
          // Permettre la fermeture seulement si l'utilisateur clique explicitement
          if (!isOpen) {
            handleClose();
          }
        }}>
          <DialogContent className="sm:max-w-[600px] h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 shrink-0">
              <DialogHeader>
                <DialogTitle>Résultats du quiz</DialogTitle>
                <DialogDescription>
                  {isShowingPreviousAttempt
                    ? `Résultats précédents du quiz "${quiz.name}"`
                    : `Vous avez terminé le quiz "${quiz.name}"`}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="text-center space-y-2 shrink-0 px-6 pb-4">
              {isGoodScore && (
                <div className="flex justify-center mb-2">
                  <Trophy className="size-12 text-yellow-500" />
                </div>
              )}
              <div className="text-4xl font-bold">
                {result.score} / {result.totalPoints}
              </div>
              <div
                className={`text-2xl font-semibold ${
                  isExcellentScore
                    ? "text-yellow-500"
                    : isGoodScore
                      ? "text-green-500"
                      : result.percentage >= 50
                        ? "text-orange-500"
                        : "text-red-500"
                }`}
              >
                {result.percentage}%
              </div>
              {isExcellentScore && (
                <p className="text-sm text-muted-foreground">
                  Excellent travail ! 🎉
                </p>
              )}
              {isGoodScore && !isExcellentScore && (
                <p className="text-sm text-muted-foreground">
                  Très bien ! 👏
                </p>
              )}
            </div>
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-2 pr-4">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  let isCorrect = false;
                  let selectedAnswer = null;
                  
                  if (question.type === "short-answer") {
                    // Pour les réponses courtes, comparer le texte
                    const correctAnswer = question.answers.find((a) => a.isCorrect);
                    if (correctAnswer && userAnswer) {
                      const userText = userAnswer.trim().toLowerCase();
                      const correctText = correctAnswer.text.trim().toLowerCase();
                      isCorrect = userText === correctText;
                    }
                    selectedAnswer = correctAnswer;
                  } else {
                    // Pour les autres types, utiliser l'ID
                    selectedAnswer = question.answers.find(
                      (a) => a.id === userAnswer
                    );
                    isCorrect = selectedAnswer?.isCorrect ?? false;
                  }
                  
                  const correctAnswer = question.answers.find((a) => a.isCorrect);
                  const isRevealed = revealedAnswers.has(question.id);

                  return (
                    <Card key={question.id} className="mb-2">
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Question {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">{question.question}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                                <span className="text-sm text-green-500">
                                  Correct (+{question.points} point{question.points > 1 ? "s" : ""})
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="size-5 text-red-500 shrink-0" />
                                <span className="text-sm text-red-500">
                                  Incorrect
                                </span>
                              </>
                            )}
                          </div>
                          {question.type === "short-answer" && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">
                                Votre réponse :
                              </p>
                              <p className="text-sm font-medium">{userAnswer || "(Aucune réponse)"}</p>
                            </div>
                          )}
                          {!isCorrect && correctAnswer && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground mb-2">
                                La bonne réponse :
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRevealAnswer(question.id)}
                                className="w-full text-left"
                              >
                                <div
                                  className={`p-2 rounded border transition-all ${
                                    isRevealed
                                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                      : "bg-muted border-muted-foreground/20 cursor-pointer hover:bg-muted/80"
                                  }`}
                                >
                                  <span
                                    className={`text-sm ${
                                      isRevealed
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-muted-foreground blur-sm select-none"
                                    }`}
                                  >
                                    {correctAnswer.text}
                                  </span>
                                  {!isRevealed && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Cliquez pour révéler
                                    </p>
                                  )}
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
            <DialogFooter className="shrink-0 px-6 pb-6 pt-4">
              {isShowingPreviousAttempt ? (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    Fermer
                  </Button>
                  <Button onClick={handleRestart}>
                    Recommencer le quiz
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleRestart}>
                    Recommencer
                  </Button>
                  <Button onClick={handleClose}>Fermer</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz.name}</DialogTitle>
          {quiz.description && (
            <DialogDescription>{quiz.description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
              <span>{currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""}</span>
            </div>
            <Progress value={progress} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === "short-answer" ? (
                <div className="space-y-2">
                  <Label htmlFor={`answer-${currentQuestion.id}`}>
                    Votre réponse
                  </Label>
                  <Input
                    id={`answer-${currentQuestion.id}`}
                    type="text"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Entrez votre réponse"
                    className="w-full"
                  />
                </div>
              ) : currentQuestion.type === "true-false" ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value)
                  }
                >
                  {currentQuestion.answers.map((answer) => (
                    <div key={answer.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label
                        htmlFor={answer.id}
                        className="flex-1 cursor-pointer py-2"
                      >
                        {answer.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value)
                  }
                >
                  {currentQuestion.answers.map((answer) => (
                    <div key={answer.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label
                        htmlFor={answer.id}
                        className="flex-1 cursor-pointer py-2"
                      >
                        {answer.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Précédent
            </Button>
            <div className="flex gap-2">
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    (currentQuestion.type === "short-answer"
                      ? !answers[currentQuestion.id]?.trim()
                      : !answers[currentQuestion.id])
                  }
                >
                  {isSubmitting ? "Envoi..." : "Terminer"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    currentQuestion.type === "short-answer"
                      ? !answers[currentQuestion.id]?.trim()
                      : !answers[currentQuestion.id]
                  }
                >
                  Suivant
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
