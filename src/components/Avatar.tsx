import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const seed = encodeURIComponent(name || "otani");
  const url = src || `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c7d2fe,e0e7ff,ddd6fe`;
  return (
    <img
      src={url}
      alt={name || "avatar"}
      width={size}
      height={size}
      className={cn("rounded-full bg-secondary object-cover ring-2 ring-background", className)}
      style={{ width: size, height: size }}
    />
  );
}