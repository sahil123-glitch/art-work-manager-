import type React from 'react'
import { useMemo, useState } from 'react'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'
import { OverlayPanel } from 'primereact/overlaypanel'

export type SelectionOverlayProps = Readonly<{
  overlayRef: React.RefObject<OverlayPanel | null>
  maxOnPage: number
  onApply: (n: number) => void
}>

export function SelectionOverlay({ overlayRef, maxOnPage, onApply }: SelectionOverlayProps) {
  const [value, setValue] = useState<number | null>(null)

  const helperText = useMemo(() => {
    if (maxOnPage === 0) return 'No rows available on this page.'
    return `Enter number of rows to select on the current page (max ${maxOnPage}).`
  }, [maxOnPage])

  return (
    <OverlayPanel ref={overlayRef} style={{ width: '22rem' }}>
      <div className="flex flex-column gap-3">
        <div className="text-base font-medium">Select Multiple Rows</div>
        <div className="text-sm text-color-secondary">{helperText}</div>

        <div className="flex flex-column gap-2">
          <label htmlFor="selectN" className="text-sm font-medium">
            Number of rows
          </label>
          <InputNumber
            id="selectN"
            value={value}
            onValueChange={(e) => setValue(e.value ?? null)}
            min={0}
            max={maxOnPage}
            showButtons
            buttonLayout="horizontal"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            inputStyle={{ width: '100%' }}
            placeholder="Enter a number"
          />
        </div>

        <div className="flex justify-content-end">
          <Button
            type="button"
            label="Select"
            onClick={() => {
              const n = value ?? 0
              onApply(n)
              overlayRef.current?.hide()
            }}
            disabled={maxOnPage === 0}
          />
        </div>
      </div>
    </OverlayPanel>
  )
}

