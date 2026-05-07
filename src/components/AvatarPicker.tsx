import { useRef, useState } from "react";
import { Camera } from "lucide-react";

type Props = {
  value: File | null;
  onChange: (f: File | null) => void;
  size?: number;
  label?: string;
};

export default function AvatarPicker({ value, onChange, size = 96, label = "Add photo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const pick = (f: File | null) => {
    onChange(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative rounded-full overflow-hidden glass hover-glow-white grid place-items-center group"
        style={{ width: size, height: size }}
        aria-label="Upload profile photo"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <Camera className="h-5 w-5" />
            <span className="text-[9px] mt-1 uppercase tracking-widest">Photo</span>
          </div>
        )}
        <span className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-full pointer-events-none" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > 4 * 1024 * 1024) { alert("Max 4 MB"); return; }
          pick(f);
        }}
      />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {value ? "Tap to change" : label}
      </span>
    </div>
  );
}
