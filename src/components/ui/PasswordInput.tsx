import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";

type PasswordInputProps = React.ComponentProps<typeof Input>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      rightElement={
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-h-0 border-none p-0 text-text-muted hover:bg-transparent"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      }
    />
  );
}
