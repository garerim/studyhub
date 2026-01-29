"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toastFromNotification, handleAPIError } from "@/lib/toast";
import { AiLoadingDialog } from "@/components/ai-loading-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Question = {
  id?: string;
  question: string;
  type: string;
  points: number;
  order: number;
  answers: {
    id?: string;
    text: string;
    isCorrect: boolean;
    order: number;
  }[];
};

type Quiz = {
  id: string;
  name: string;
  description: string | null;
  questions: Question[];
  isAIGenerated: boolean;
};

type EditQuizModalProps = {
  userId: string;
  matiereId: string;
  quiz: Quiz;
  onUpdated?: () => void;
};

export function EditQuizModal({
  userId,
  matiereId,
  quiz,
  onUpdated,
}: EditQuizModalProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(quiz.name);
  const [description, setDescription] = React.useState(quiz.description || "");
  const [questions, setQuestions] = React.useState<Question[]>(quiz.questions);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAIGenerateDialog, setShowAIGenerateDialog] = React.useState(false);
  const [showAiLoading, setShowAiLoading] = React.useState(false);
  const [aiDifficulty, setAiDifficulty] = React.useState<"easy" | "medium" | "hard">("medium");
  const [aiNumberOfQuestions, setAiNumberOfQuestions] = React.useState(5);
  const [aiCustomPrompt, setAiCustomPrompt] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(quiz.name);
      setDescription(quiz.description || "");
      setQuestions(quiz.questions);
    }
  }, [open, quiz]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "multiple-choice",
        points: 1,
        order: questions.length,
        answers: [
          { text: "", isCorrect: true, order: 0 },
          { text: "", isCorrect: false, order: 1 },
          { text: "", isCorrect: false, order: 2 },
          { text: "", isCorrect: false, order: 3 },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Adapter les réponses selon le type de question
    if (field === "type") {
      const question = updated[index];
      if (value === "true-false") {
        // Vrai/Faux : 2 réponses seulement
        question.answers = [
          { text: "Vrai", isCorrect: true, order: 0 },
          { text: "Faux", isCorrect: false, order: 1 },
        ];
      } else if (value === "short-answer") {
        // Réponse courte : 1 réponse avec le texte attendu
        question.answers = [
          { text: question.answers[0]?.text || "", isCorrect: true, order: 0 },
        ];
      } else if (value === "multiple-choice") {
        // Choix multiple : au moins 2 réponses
        if (question.answers.length < 2) {
          question.answers = [
            { text: "", isCorrect: true, order: 0 },
            { text: "", isCorrect: false, order: 1 },
            { text: "", isCorrect: false, order: 2 },
            { text: "", isCorrect: false, order: 3 },
          ];
        }
      }
    }
    
    setQuestions(updated);
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers.push({
      text: "",
      isCorrect: false,
      order: updated[questionIndex].answers.length,
    });
    setQuestions(updated);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers = updated[questionIndex].answers.filter(
      (_, i) => i !== answerIndex
    );
    setQuestions(updated);
  };

  const handleOpenAIGenerateDialog = () => {
    setShowAIGenerateDialog(true);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setError(null);
    setShowAIGenerateDialog(false);
    // Ouvrir la dialog de chargement immédiatement
    setShowAiLoading(true);
    
    try {
      // Lancer la génération en arrière-plan
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/quizes/${quiz.id}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: name,
            difficulty: aiDifficulty,
            numberOfQuestions: aiNumberOfQuestions,
            customPrompt: aiCustomPrompt.trim() || undefined,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === "QUOTA_EXCEEDED") {
          handleAPIError({
            message: errorData.error,
            code: errorData.code,
            plan: errorData.plan,
            limit: errorData.limit,
            currentUsage: errorData.currentUsage,
          } as unknown as Error);
        } else {
          // Créer une notification d'erreur
          toastFromNotification(
            "AI_ERROR",
            "Erreur de génération",
            "Une erreur est survenue lors de la génération du quiz."
          );
        }
        throw new Error(errorData.error || "Failed to generate quiz");
      }
      
      const generatedQuiz = await response.json();
      setQuestions(generatedQuiz.questions);
      
      // Afficher le toast si une notification a été créée
      if (generatedQuiz.notification) {
        toastFromNotification(
          generatedQuiz.notification.type,
          generatedQuiz.notification.title,
          generatedQuiz.notification.message
        );
      } else {
        // Notification de succès par défaut
        toastFromNotification(
          "QUIZ_GENERATED",
          "Quiz généré",
          "Votre quiz est prêt"
        );
      }
      
      onUpdated?.();
    } catch (err) {
      if (!handleAPIError(err)) {
        setError(err instanceof Error ? err.message : "Erreur lors de la génération");
        // Créer une notification d'erreur
        toastFromNotification(
          "AI_ERROR",
          "Erreur de génération",
          "Une erreur est survenue lors de la génération du quiz."
        );
      }
    } finally {
      setIsGenerating(false);
      setShowAiLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Le nom du quiz est obligatoire.");
      return;
    }

    // Valider les questions
    for (const q of questions) {
      if (!q.question.trim()) {
        setError("Toutes les questions doivent avoir un texte.");
        return;
      }
      
      if (q.type === "short-answer") {
        // Réponse courte : au moins une réponse avec du texte
        if (!q.answers[0]?.text.trim()) {
          setError("Les questions à réponse courte doivent avoir une réponse attendue.");
          return;
        }
      } else if (q.type === "true-false") {
        // Vrai/Faux : doit avoir exactement 2 réponses
        if (q.answers.length !== 2) {
          setError("Les questions Vrai/Faux doivent avoir exactement 2 réponses.");
          return;
        }
        const hasCorrect = q.answers.some((a) => a.isCorrect);
        if (!hasCorrect) {
          setError("Les questions Vrai/Faux doivent avoir une réponse correcte sélectionnée.");
          return;
        }
      } else {
        // Choix multiple : au moins 2 réponses
        if (q.answers.length < 2) {
          setError("Les questions à choix multiple doivent avoir au moins 2 réponses.");
          return;
        }
        const hasCorrect = q.answers.some((a) => a.isCorrect);
        if (!hasCorrect) {
          setError("Chaque question doit avoir au moins une réponse correcte.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/quizes/${quiz.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            questions: questions.map((q, index) => ({
              question: q.question,
              type: q.type,
              order: index,
              points: q.points,
              answers: q.answers.map((a, aIndex) => ({
                text: a.text,
                isCorrect: a.isCorrect,
                order: aIndex,
              })),
            })),
          }),
        }
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Impossible de mettre à jour le quiz.");
      }
      onUpdated?.();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le quiz</DialogTitle>
          <DialogDescription>
            Modifiez les questions et réponses de votre quiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du quiz *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAIGenerateDialog}
                  disabled={isGenerating}
                >
                  <Sparkles className="size-4 mr-2" />
                  {isGenerating ? "Génération..." : "Générer avec IA"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="size-4 mr-2" />
                  Ajouter une question
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <Card key={qIndex}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Question {qIndex + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Question *</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, "question", e.target.value)
                        }
                        placeholder="Entrez votre question"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            updateQuestion(qIndex, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">
                              Choix multiple
                            </SelectItem>
                            <SelectItem value="true-false">Vrai/Faux</SelectItem>
                            <SelectItem value="short-answer">
                              Réponse courte
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              "points",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {question.type === "true-false" ? (
                        <>
                          <Label>Réponse correcte *</Label>
                          <RadioGroup
                            value={
                              question.answers.find((a) => a.isCorrect)?.text === "Vrai"
                                ? "true"
                                : "false"
                            }
                            onValueChange={(value) => {
                              const updated = [...questions];
                              updated[qIndex].answers = [
                                { text: "Vrai", isCorrect: value === "true", order: 0 },
                                { text: "Faux", isCorrect: value === "false", order: 1 },
                              ];
                              setQuestions(updated);
                            }}
                          >
                            <div className="flex items-center space-x-2 p-2 border rounded">
                              <RadioGroupItem value="true" id={`${qIndex}-true`} />
                              <Label htmlFor={`${qIndex}-true`} className="cursor-pointer flex-1">
                                Vrai
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-2 border rounded">
                              <RadioGroupItem value="false" id={`${qIndex}-false`} />
                              <Label htmlFor={`${qIndex}-false`} className="cursor-pointer flex-1">
                                Faux
                              </Label>
                            </div>
                          </RadioGroup>
                        </>
                      ) : question.type === "short-answer" ? (
                        <>
                          <Label>Réponse attendue *</Label>
                          <Input
                            value={question.answers[0]?.text || ""}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIndex].answers = [
                                { text: e.target.value, isCorrect: true, order: 0 },
                              ];
                              setQuestions(updated);
                            }}
                            placeholder="Entrez la réponse attendue"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            La réponse sera comparée (insensible à la casse)
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <Label>Réponses *</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addAnswer(qIndex)}
                            >
                              <Plus className="size-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                          {question.answers.map((answer, aIndex) => (
                            <div
                              key={aIndex}
                              className="flex items-center gap-2 p-2 border rounded"
                            >
                              <input
                                type="checkbox"
                                checked={answer.isCorrect}
                                onChange={(e) =>
                                  updateAnswer(
                                    qIndex,
                                    aIndex,
                                    "isCorrect",
                                    e.target.checked
                                  )
                                }
                                className="size-4"
                              />
                              <Input
                                value={answer.text}
                                onChange={(e) =>
                                  updateAnswer(qIndex, aIndex, "text", e.target.value)
                                }
                                placeholder="Texte de la réponse"
                                className="flex-1"
                                required
                              />
                              {question.answers.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAnswer(qIndex, aIndex)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Dialog pour la génération IA */}
      <Dialog open={showAIGenerateDialog} onOpenChange={setShowAIGenerateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Générer un quiz avec l&apos;IA</DialogTitle>
            <DialogDescription>
              Configurez les paramètres de génération du quiz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-difficulty">Difficulté</Label>
              <Select
                value={aiDifficulty}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  setAiDifficulty(value)
                }
              >
                <SelectTrigger id="ai-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-number">Nombre de questions</Label>
              <Input
                id="ai-number"
                type="number"
                min="1"
                max="20"
                value={aiNumberOfQuestions}
                onChange={(e) =>
                  setAiNumberOfQuestions(
                    Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Entre 1 et 20 questions
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-prompt">
                Instructions supplémentaires (optionnel)
              </Label>
              <Textarea
                id="ai-prompt"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Ex: Focus sur les concepts clés, inclure des exemples pratiques, questions sur les applications réelles..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Ajoutez des instructions pour personnaliser le quiz selon vos besoins
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAIGenerateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
            >
              {isGenerating ? "Génération..." : "Générer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de chargement IA */}
      <AiLoadingDialog
        open={showAiLoading}
        onOpenChange={(open) => {
          // Permettre à l'utilisateur de fermer la dialog sans annuler la génération
          setShowAiLoading(open)
        }}
        animationPath="/AiPowered.lottie"
      />
    </Dialog>
  );
}
