import React, { useRef } from "react";
import type { UploadedFileInfo } from "../../types/formulaire";

export interface FieldErrorProps {
  error?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;
  return (
    <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1.5 animate-fade-up">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </p>
  );
};

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  required,
  error,
  helperText,
  id,
  className = "",
  ...props
}) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-bold text-[#193549] uppercase tracking-wider mb-2"
      >
        {label} {required && <span className="text-[#F15B29]">*</span>}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-[#193549] bg-white transition-all outline-none ${
          error
            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400"
            : "border-slate-200 focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]"
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-[#5C6B76] mt-1">{helperText}</p>
      )}
      <FieldError error={error} />
    </div>
  );
};

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  required,
  error,
  helperText,
  id,
  rows = 4,
  className = "",
  ...props
}) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-bold text-[#193549] uppercase tracking-wider mb-2"
      >
        {label} {required && <span className="text-[#F15B29]">*</span>}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-[#193549] bg-white transition-all outline-none resize-y ${
          error
            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400"
            : "border-slate-200 focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]"
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-[#5C6B76] mt-1">{helperText}</p>
      )}
      <FieldError error={error} />
    </div>
  );
};

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required,
  error,
  helperText,
  options,
  placeholder = "Sélectionnez une option",
  id,
  className = "",
  ...props
}) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-bold text-[#193549] uppercase tracking-wider mb-2"
      >
        {label} {required && <span className="text-[#F15B29]">*</span>}
      </label>
      <select
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-[#193549] bg-white transition-all outline-none cursor-pointer ${
          error
            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400"
            : "border-slate-200 focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]"
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="text-xs text-[#5C6B76] mt-1">{helperText}</p>
      )}
      <FieldError error={error} />
    </div>
  );
};

export interface FileFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  accept?: string;
  fileInfo: UploadedFileInfo | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  previewImage?: boolean;
}

export const FileField: React.FC<FileFieldProps> = ({
  label,
  required,
  error,
  helperText,
  accept,
  fileInfo,
  onFileSelect,
  onFileRemove,
  previewImage = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-[#193549] uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#F15B29]">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {fileInfo ? (
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-3 overflow-hidden">
            {previewImage && fileInfo.previewUrl ? (
              <img
                src={fileInfo.previewUrl}
                alt="Aperçu"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F15B29] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#193549] truncate">{fileInfo.name}</p>
              <p className="text-[11px] text-[#5C6B76]">{fileInfo.size}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onFileRemove();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            title="Supprimer le fichier"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
            error
              ? "border-red-300 bg-red-50 hover:border-red-400"
              : "border-slate-200 bg-slate-50 hover:border-[#F15B29] hover:bg-orange-50"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-orange-100 text-slate-400 group-hover:text-[#F15B29] flex items-center justify-center transition-colors mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#193549] group-hover:text-[#F15B29] transition-colors">
            Cliquer pour sélectionner un fichier
          </p>
          <p className="text-[11px] text-[#5C6B76] mt-1">
            {helperText || "Max 10 Mo • JPG, PNG, WEBP ou PDF"}
          </p>
        </div>
      )}

      <FieldError error={error} />
    </div>
  );
};

export interface YesNoFieldProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const YesNoField: React.FC<YesNoFieldProps> = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}) => {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-[#193549] uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#F15B29]">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
            value === true
              ? "bg-[#193549] text-white border-[#193549] shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
            value === false
              ? "bg-slate-200 text-[#193549] border-slate-300 font-black"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          Non
        </button>
      </div>
      {helperText && !error && (
        <p className="text-xs text-[#5C6B76] mt-1">{helperText}</p>
      )}
      <FieldError error={error} />
    </div>
  );
};

export interface CheckboxCardProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
}

export const CheckboxCard: React.FC<CheckboxCardProps> = ({
  label,
  description,
  checked,
  onChange,
  required,
  error,
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`rounded-2xl p-4 sm:p-5 transition-all cursor-pointer ${
        checked
          ? "border-0 bg-transparent shadow-none ring-0"
          : error
            ? "border-2 border-red-400 bg-red-50"
            : "border-2 border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <label className="flex items-start gap-3.5 cursor-pointer select-none">
        <div
          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
            checked
              ? "border-[#F15B29] bg-[#F15B29]"
              : error
                ? "border-red-400 bg-white"
                : "border-slate-300 bg-white"
          }`}
        >
          {checked && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-bold text-[#193549] leading-snug">
            {label} {required && <span className="text-[#F15B29]">*</span>}
          </p>
          {description && (
            <p className="text-xs text-[#5C6B76] mt-1 leading-relaxed">{description}</p>
          )}
          <FieldError error={error} />
        </div>
      </label>
    </div>
  );
};
