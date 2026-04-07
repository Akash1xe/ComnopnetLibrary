const labels = ["Weak", "Fair", "Good", "Strong"] as const;
const colors = ["bg-red-500", "bg-yellow-500", "bg-lime-500", "bg-cyan-400"] as const;

export function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordStrength(password);
  const normalized = Math.max(0, Math.min(4, score));
  const activeColor = normalized === 0 ? "bg-[#222]" : colors[Math.max(0, normalized - 1)];
  const label = labels[Math.max(0, normalized - 1)] ?? "Weak";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full ${index < normalized ? activeColor : "bg-[#222]"}`}
          />
        ))}
      </div>
      <p className="text-xs text-[#888]">{label}</p>
    </div>
  );
}
