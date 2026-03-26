import * as React from "react"
import { Input } from "./input"
import { formatThousands, parseThousands } from "@/shared/lib/utils"

interface NumericInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string | number
  onValueChange?: (value: string) => void
  allowDecimals?: boolean
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onValueChange, allowDecimals = false, ...props }, ref) => {
    const displayValue = React.useMemo(() => formatThousands(value), [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = parseThousands(e.target.value)
      
      // Validation: only digits (and one dot/comma if decimals allowed)
      const isValid = allowDecimals 
        ? /^\d*([.,]\d*)?$/.test(rawValue)
        : /^\d*$/.test(rawValue)

      if (isValid) {
        onValueChange?.(rawValue.replace(',', '.'))
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        value={displayValue}
        onChange={handleChange}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
