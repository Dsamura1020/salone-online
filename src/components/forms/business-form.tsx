"use client";

import type { DocumentType } from "@prisma/client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import { UploadIcon } from "@/components/layouts/icons";

type CategoryOption = {
  id: string;
  name: string;
  parentCategoryId: string | null;
  parentCategory: { id: string; name: string } | null;
};

type LocationOption = {
  id: string;
  city: string;
  stateProvince: string | null;
  country: string;
};

type BusinessDocumentItem = {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: string;
  uploadedAt: string;
};

type BusinessFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  locations: LocationOption[];
  initialBusiness?: {
    id: string;
    businessName: string;
    categoryId: string;
    locationId: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    logoUrl: string | null;
    verificationStatus: string;
    hasVerificationRequest?: boolean;
    documents: BusinessDocumentItem[];
  };
};

type BusinessPayload = {
  categoryId: string;
  locationId: string;
  businessName: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

const DOCUMENT_TYPES: DocumentType[] = [
  "BUSINESS_LICENSE",
  "TAX_CERTIFICATE",
  "INCORPORATION",
  "ID_DOCUMENT",
  "UTILITY_BILL",
  "OTHER",
];

export function BusinessForm({
  mode,
  categories,
  locations,
  initialBusiness,
}: BusinessFormProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [businessId, setBusinessId] = useState(initialBusiness?.id ?? null);
  const [businessName, setBusinessName] = useState(initialBusiness?.businessName ?? "");
  const [categoryId, setCategoryId] = useState(initialBusiness?.categoryId ?? "");
  const [phone, setPhone] = useState(initialBusiness?.phone ?? "");
  const [email, setEmail] = useState(initialBusiness?.email ?? "");
  const [locationId, setLocationId] = useState(initialBusiness?.locationId ?? "");
  const [website, setWebsite] = useState(initialBusiness?.website ?? "");
  const [description, setDescription] = useState(initialBusiness?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(initialBusiness?.logoUrl ?? null);
  const [documents, setDocuments] = useState<BusinessDocumentItem[]>(
    initialBusiness?.documents ?? [],
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("BUSINESS_LICENSE");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const saveDraftBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (businessName.trim().length < 2) {
      blockers.push("Business name must be at least 2 characters.");
    }
    if (!isUuid(categoryId)) {
      blockers.push("Select a valid business category.");
    }
    if (!isUuid(locationId)) {
      blockers.push("Select a valid location.");
    }
    return blockers;
  }, [businessName, categoryId, locationId]);

  const canSaveDraft = saveDraftBlockers.length === 0;

  const submissionBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (!businessId) {
      blockers.push("Save draft first before submitting for verification.");
    }
    if (businessName.trim().length < 2) {
      blockers.push("Business name is required.");
    }
    if (!categoryId) {
      blockers.push("Business category is required.");
    }
    if (!locationId) {
      blockers.push("Location is required.");
    }
    if (description.trim().length === 0) {
      blockers.push("Business description is required.");
    }
    if (documents.length === 0) {
      blockers.push("Upload at least one verification document.");
    }
    return blockers;
  }, [businessId, businessName, categoryId, locationId, description, documents]);

  const canSubmitForVerification = submissionBlockers.length === 0;

  async function saveBusiness(logoToUpload?: File) {
    if (!canSaveDraft) {
      setError(saveDraftBlockers[0] ?? "Complete required fields before saving.");
      setSuccess(null);
      return null;
    }

    const normalizedBusinessName = businessName.trim();
    const normalizedWebsite = normalizeWebsiteUrl(website);

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload: BusinessPayload = {
      businessName: normalizedBusinessName,
      categoryId,
      locationId,
      description,
      email,
      phone,
      website: normalizedWebsite,
    };

    const endpoint = businessId ? `/api/businesses/${businessId}` : "/api/businesses";
    const method = businessId ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Save failed");
      return null;
    }

    const body = (await response.json()) as {
      data: { id: string; logoUrl: string | null };
    };

    if (!businessId) {
      setBusinessId(body.data.id);
      const pendingLogo = logoToUpload ?? logoFile;
      if (pendingLogo) {
        await uploadLogo(pendingLogo, body.data.id);
      } else {
        setSuccess("Business created. Continue by uploading logo/documents.");
      }
      router.push(`/dashboard/owner/businesses/${body.data.id}/edit`);
      return body.data.id;
    }

    setSuccess("Business details saved.");
    router.refresh();
    return body.data.id;
  }

  async function submitForVerification() {
    if (!canSubmitForVerification) {
      setError(submissionBlockers[0] ?? "Complete required fields before submitting.");
      return;
    }

    setSubmittingVerification(true);
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/businesses/${businessId}/submit`, {
      method: "POST",
    });
    setSubmittingVerification(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Verification submission failed");
      return;
    }

    setSuccess(null);
    await Swal.fire({
      icon: "success",
      title: "Submitted for verification",
      text: "Your business has been sent to the administrators for review.",
      confirmButtonText: "Done",
      confirmButtonColor: "#10206f",
    });
    router.refresh();
  }

  async function uploadLogo(fileOverride?: File, businessIdOverride?: string) {
    const fileToUpload = fileOverride ?? logoFile;
    const targetBusinessId = businessIdOverride ?? businessId;
    if (!targetBusinessId || !fileToUpload) {
      setError("Please save the business and choose a logo file first.");
      return;
    }

    setUploadingLogo(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("logo", fileToUpload);

    const response = await fetch(`/api/businesses/${targetBusinessId}/logo`, {
      method: "POST",
      body: formData,
    });

    setUploadingLogo(false);
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Logo upload failed");
      return;
    }

    const body = (await response.json()) as {
      data: { logoUrl: string | null };
    };
    setLogoUrl(body.data.logoUrl);
    setLogoFile(null);
    setSuccess("Logo uploaded.");
  }

  function onLogoSelected(file: File | null) {
    setLogoFile(file);
    setError(null);
    setSuccess(null);

    if (!file) {
      return;
    }

    if (businessId) {
      void uploadLogo(file, businessId);
      return;
    }

    if (!canSaveDraft) {
      setError(
        "Enter the business name, category, and location before uploading a logo.",
      );
      return;
    }

    void saveBusiness(file);
  }

  async function uploadDocuments(files: File[]) {
    if (!businessId || files.length === 0) {
      setError("Please save the business and choose document(s) first.");
      return;
    }

    setUploadingDocument(true);
    setError(null);
    setSuccess(null);

    let uploadedCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.set("documentType", documentType);
      formData.set("document", file);

      const response = await fetch(`/api/businesses/${businessId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? `Failed to upload ${file.name}`);
        continue;
      }

      const body = (await response.json()) as { data: BusinessDocumentItem };
      setDocuments((current) => [body.data, ...current]);
      uploadedCount++;
    }

    setUploadingDocument(false);
    setDocumentFile(null);
    if (uploadedCount > 0) {
      setSuccess(
        uploadedCount === 1
          ? "1 document uploaded."
          : `${uploadedCount} documents uploaded.`,
      );
    }
  }

  function onDocumentsSelected(files: FileList | null) {
    if (!files || files.length === 0) {
      setDocumentFile(null);
      return;
    }
    const selectedFiles = Array.from(files);
    setDocumentFile(selectedFiles[selectedFiles.length - 1] ?? null);
    if (!businessId) {
      setError("Please save draft first, then upload documents.");
      return;
    }
    void uploadDocuments(selectedFiles);
  }

  async function deleteDocument(documentId: string) {
    if (!businessId) {
      return;
    }

    setDeletingDocumentId(documentId);
    setError(null);
    setSuccess(null);

    const response = await fetch(
      `/api/businesses/${businessId}/documents/${documentId}`,
      {
        method: "DELETE",
      },
    );

    setDeletingDocumentId(null);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to delete document.");
      return;
    }

    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
    setSuccess("Document deleted.");
  }

  const hasVerificationRequest = initialBusiness?.hasVerificationRequest ?? false;
  const showVerificationGuidance =
    mode === "edit" && !hasVerificationRequest && initialBusiness?.verificationStatus !== "APPROVED";

  return (
    <div className="space-y-6">
      {showVerificationGuidance && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <h2 className="text-lg font-semibold text-indigo-950">
            Complete your business verification
          </h2>
          <p className="mt-2 text-sm leading-6 text-indigo-900">
            Your business listing has been created. Add a description, upload at
            least one verification document, then click{" "}
            <strong>Submit for Verification</strong> so admins can review it.
            Once approved, your business will appear in search and users can
            rate and review it.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
              {mode === "create" ? "Register Business" : "Edit Business Profile"}
            </h2>
            <p className="mt-1 text-base text-slate-500">
              {mode === "create"
                ? "Create a new business listing for admin verification"
                : hasVerificationRequest
                  ? "Update your listing while verification is in progress"
                  : "Complete your profile and submit for admin verification"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void saveBusiness()}
            disabled={loading || !canSaveDraft}
            className="rounded-2xl bg-[#10206f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
        </div>
        {!canSaveDraft && (
          <p className="mt-3 text-sm text-slate-500">{saveDraftBlockers[0]}</p>
        )}
      </section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-[38px] font-semibold leading-none text-slate-950">
            Business Information
          </h3>
          <p className="mt-2 text-lg text-slate-500">
            Provide the core details users will see on the platform
          </p>

          <div className="mt-6 grid gap-4">
            <input
              className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none focus:border-[#10206f]"
              placeholder="Business name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none focus:border-[#10206f]"
              >
                <option value="">Business category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.parentCategory
                      ? `${category.parentCategory.name} / ${category.name}`
                      : category.name}
                  </option>
                ))}
              </select>
              <input
                className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none focus:border-[#10206f]"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none focus:border-[#10206f]"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <select
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none focus:border-[#10206f]"
              >
                <option value="">Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.city}, {location.stateProvince ?? "N/A"} ({location.country})
                  </option>
                ))}
              </select>
            </div>

            <input
              className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none focus:border-[#10206f]"
              placeholder="Website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />

            <textarea
              className="min-h-[190px] rounded-[24px] border border-slate-200 px-5 py-4 text-base text-slate-700 outline-none placeholder:text-slate-500 focus:border-[#10206f]"
              placeholder="Business description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Business profile logo
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                PNG, JPG, or WEBP up to 2MB. Square images work best.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`${businessName || "Business"} logo`}
                      width={96}
                      height={96}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-[#10206f]">
                      {(businessName.trim().slice(0, 2) || "SL").toUpperCase()}
                    </span>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(event) => {
                    onLogoSelected(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                  className="hidden"
                />
                <div>
                  <button
                    type="button"
                    disabled={uploadingLogo || loading}
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#10206f] bg-white px-4 text-sm font-semibold text-[#10206f] transition hover:bg-[#10206f]/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UploadIcon className="size-4" />
                    {uploadingLogo
                      ? "Uploading..."
                      : logoUrl
                        ? "Change logo"
                        : "Upload logo"}
                  </button>
                  {logoFile && (
                    <p className="mt-2 max-w-xs truncate text-xs text-slate-500">
                      Selected: {logoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <input
              id="business-document-file"
              type="file"
              multiple
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(event) => {
                onDocumentsSelected(event.target.files);
                event.currentTarget.value = "";
              }}
              className="hidden"
            />
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-6">
              <label
                htmlFor="business-document-file"
                className="block cursor-pointer text-center"
              >
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                  >
                    <path d="M12 16V4" strokeLinecap="round" />
                    <path
                      d="m7 9 5-5 5 5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16.5v1.5A2 2 0 0 0 6 20h12a2 2 0 0 0 2-2v-1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <p className="mt-3 text-[17px] font-semibold leading-none text-slate-950">
                  Upload verification documents
                </p>
                <p className="mt-2 text-[15px] leading-none text-slate-500">
                  Certificate, tax record, business registration, or ID
                </p>
                {uploadingDocument && (
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Uploading document...
                  </p>
                )}
                {documentFile && !uploadingDocument && (
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Selected: {documentFile.name}
                  </p>
                )}
                {!uploadingDocument && (
                  <p className="mt-2 text-xs text-slate-500">
                    You can select and upload multiple documents.
                  </p>
                )}
              </label>

              <div
                className={`mt-4 flex flex-wrap items-center justify-center gap-2 ${
                  documentFile ? "" : "hidden"
                }`}
              >
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value as DocumentType)}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700"
                >
                  {DOCUMENT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="business-document-file"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {documentFile ? "Change file" : "Choose file"}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    documentFile ? void uploadDocuments([documentFile]) : undefined
                  }
                  disabled={uploadingDocument || !documentFile}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                >
                  {uploadingDocument ? "Uploading..." : "Upload"}
                </button>
              </div>

              {documents.length > 0 && (
                <ul className="mt-4 space-y-2 rounded-2xl border border-slate-200 p-3">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {document.fileName}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View document"
                        title="View document"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#10206f] hover:bg-slate-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={() => void deleteDocument(document.id)}
                        disabled={deletingDocumentId === document.id}
                        aria-label="Delete document"
                        title="Delete document"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingDocumentId === document.id ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4 animate-spin"
                          >
                            <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                          >
                            <path d="M3 6h18" strokeLinecap="round" />
                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                            <path d="M6 6l1 14a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9l1-14" />
                            <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </li>
                ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => void submitForVerification()}
              disabled={submittingVerification}
              className="h-[64px] w-full rounded-[20px] bg-[#10206f] text-[17px] font-semibold text-white disabled:opacity-50"
            >
              {submittingVerification ? "Submitting..." : "Submit for Verification"}
            </button>
            {!canSubmitForVerification && (
              <p className="text-center text-sm text-slate-500">
                {submissionBlockers[0]}
              </p>
            )}
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-[38px] font-semibold leading-none text-slate-950">
            Submission Checklist
          </h3>
          <p className="mt-2 text-lg text-slate-500">
            What admins will review before approval
          </p>

          <ul className="mt-6 space-y-4 text-lg">
            <li className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
              <ChecklistIndicator complete={Boolean(email.trim() && phone.trim())} />
              <span className="text-slate-700">Complete contact information</span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
              <ChecklistIndicator complete={description.trim().length >= 30} />
              <span className="text-slate-700">Clear business description</span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
              <ChecklistIndicator complete={documents.length > 0} />
              <span className="text-slate-700">Valid verification documents</span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
              <ChecklistIndicator complete={Boolean(categoryId && locationId)} />
              <span className="text-slate-700">Accurate location and category</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function ChecklistIndicator({ complete }: { complete: boolean }) {
  return (
    <span
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-[#10206f] text-sm font-bold ${
        complete ? "bg-[#10206f] text-white" : "bg-white text-[#10206f]"
      }`}
      aria-hidden="true"
    >
      {complete ? "✓" : ""}
    </span>
  );
}
