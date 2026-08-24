import { minimumAgeCondition } from "../../components/ui/DatePicker";
import type {
  ApplicantDocuments,
  ApplicationType,
  JointApplicant,
  PhotoIdType,
  UploadedDocument,
} from "./types";

export const isJointType = (type: ApplicationType) =>
  type === "joint-same" || type === "joint-different-name" || type === "joint-different-address";

export const usesSharedAddress = (type: ApplicationType) => type === "joint-same" || type === "joint-different-name";

export const formatApplicantName = (applicant: {
  firstName: string;
  middleName: string;
  lastName: string;
}) => [applicant.firstName, applicant.middleName, applicant.lastName].filter(Boolean).join(" ").trim();

export const documentFromFile = (file?: File): UploadedDocument | undefined =>
  file
    ? {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        previewUrl: URL.createObjectURL(file),
      }
    : undefined;

export const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

export const displayNameFromEmail = (email: string) => {
  const localPart = email.split("@")[0] || "";
  const words = localPart.split(/[._-]+/).filter(Boolean);
  if (!words.length) return "Alex Morgan";
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export const isValidWebsiteUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".");
  } catch {
    return false;
  }
};

export const ADULT_DATE_CONDITIONS = [
  minimumAgeCondition(18, "The selected person must be at least 18 years old."),
] as const;

export const DOB_HELPER_TEXT =
  "Select the month and search for the year directly. Applicants must be at least 18 years old.";
export const DOB_MAX_YEAR = new Date().getFullYear();
export const DOB_MIN_YEAR = DOB_MAX_YEAR - 120;

export const isCompleteJointPersonal = (applicant: JointApplicant, sharedAddress: boolean) => {
  if (applicant.method === "existing") return applicant.confirmed && Boolean(applicant.clientId);
  return Boolean(
    applicant.confirmed &&
      applicant.firstName.trim() &&
      isValidEmail(applicant.email) &&
      (sharedAddress || applicant.residentialAddress.trim()),
  );
};

export const requiresTwoPhotoIds = (country: string) => Boolean(country && country !== "Australia");

export const isPhotoIdUploadComplete = (
  type?: PhotoIdType,
  front?: UploadedDocument,
  back?: UploadedDocument,
) => Boolean(type && front && (type !== "driving-licence" || back));

export const isSameUploadedFile = (first?: UploadedDocument, second?: UploadedDocument) =>
  Boolean(first && second && first.name === second.name && first.size === second.size && first.type === second.type);

export const hasDistinctPhotoIdFiles = (documents?: ApplicantDocuments) => {
  if (!documents) return false;
  const firstFiles = [documents.photoIdFront, documents.photoIdBack].filter(Boolean) as UploadedDocument[];
  const secondFiles = [documents.secondaryPhotoIdFront, documents.secondaryPhotoIdBack].filter(Boolean) as UploadedDocument[];
  return !firstFiles.some((first) => secondFiles.some((second) => isSameUploadedFile(first, second)));
};

export const hasPhotoIdentity = (documents: ApplicantDocuments | undefined, country: string) => {
  if (!documents || !isPhotoIdUploadComplete(documents.photoIdType, documents.photoIdFront, documents.photoIdBack)) {
    return false;
  }
  if (!requiresTwoPhotoIds(country)) return true;
  return Boolean(
    documents.secondaryPhotoIdType &&
      documents.secondaryPhotoIdType !== documents.photoIdType &&
      isPhotoIdUploadComplete(
        documents.secondaryPhotoIdType,
        documents.secondaryPhotoIdFront,
        documents.secondaryPhotoIdBack,
      ) &&
      hasDistinctPhotoIdFiles(documents),
  );
};

export const hasDrivingLicenceProof = (documents?: ApplicantDocuments) =>
  documents?.photoIdType === "driving-licence" || documents?.secondaryPhotoIdType === "driving-licence";

export const hasAddressEvidence = (documents?: ApplicantDocuments) =>
  Boolean(
    hasDrivingLicenceProof(documents) ||
      (documents?.addressDocumentType && documents.addressDocument),
  );

export const hasPersonalDetailsEvidence = (documents?: ApplicantDocuments) => {
  if (!documents) return false;
  const websiteUrl = documents.websiteUrl?.trim() || "";
  return Boolean((documents.cv || isValidWebsiteUrl(websiteUrl)) && (!websiteUrl || isValidWebsiteUrl(websiteUrl)));
};

export const hasCompleteApplicantProof = (documents: ApplicantDocuments | undefined, country: string) =>
  hasPhotoIdentity(documents, country) && hasAddressEvidence(documents) && hasPersonalDetailsEvidence(documents);

