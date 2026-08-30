import { useTheme } from "@/lib/hooks";
import { Monitor, Moon, Sun } from "./icons";

const OPTIONS = [
  { key: "system", label: "System", Icon: Monitor },
  { key: "light", label: "Slate", Icon: Sun },
  { key: "dark", label: "Noir", Icon: Moon },
] as const;

export function ThemeToggle() {
  const [choice, setChoice] = useTheme();
  return (
    <div className="seg" role="group" aria-label="Theme">
      {OPTIONS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          data-active={choice === key}
          aria-pressed={choice === key}
          onClick={() => setChoice(key)}
          title={label}
        >
          <Icon />
          <span className="visually-hidden">{label}</span>
        </button>
      ))}
    </div>
  );
}
