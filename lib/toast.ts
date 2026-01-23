/**
 * Helpers UI pour les toasts
 * UNIQUEMENT pour l'affichage (aucune logique métier)
 */
import { toast as sonnerToast } from "sonner";
import { QuotaExceededError } from "@/errors/quotaExceeded.error";

export function toastSuccess(message: string, title?: string) {
  sonnerToast.success(title || "Succès", {
    description: message,
  });
}

export function toastError(message: string, title?: string) {
  sonnerToast.error(title || "Erreur", {
    description: message,
  });
}

export function toastInfo(message: string, title?: string) {
  sonnerToast.info(title || "Information", {
    description: message,
  });
}

export function toastWarning(message: string, title?: string) {
  sonnerToast.warning(title || "Avertissement", {
    description: message,
  });
}

/**
 * Affiche un toast basé sur le type de notification
 * @param type - Type de notification
 * @param title - Titre de la notification
 * @param message - Message de la notification
 */
export function toastFromNotification(
  type: string,
  title: string,
  message: string
) {
  switch (type) {
    case "SUBSCRIPTION_CREATED":
    case "QUIZ_GENERATED":
    case "COURSE_PROCESSED":
    case "AI_SUCCESS":
      toastSuccess(message, title);
      break;
    case "QUOTA_EXCEEDED":
    case "AI_ERROR":
      toastError(message, title);
      break;
    case "QUOTA_WARNING":
      toastWarning(message, title);
      break;
    case "SUBSCRIPTION_CANCELED":
    case "INFO":
    default:
      toastInfo(message, title);
      break;
  }
}

/**
 * Gère les erreurs API et affiche les toasts appropriés
 * @param error - Erreur à gérer
 * @returns true si l'erreur a été gérée, false sinon
 */
export function handleAPIError(error: unknown): boolean {
  if (error instanceof QuotaExceededError) {
    toastError(
      error.message,
      "Quota dépassé"
    );
    return true;
  }

  if (error instanceof Error) {
    // Vérifier si c'est une erreur de quota depuis la réponse API
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      toastError(
        error.message,
        "Quota dépassé"
      );
      return true;
    }
  }

  return false;
}
