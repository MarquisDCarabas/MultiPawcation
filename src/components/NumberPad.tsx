import type { GameAction } from '../game/types'

interface NumberPadProps {
  input: string
  dispatch: React.Dispatch<GameAction>
  disabled: boolean
}

export function NumberPad({ input, dispatch, disabled }: NumberPadProps) {
  const handleDigit = (digit: string) => {
    if (!disabled) dispatch({ type: 'INPUT_DIGIT', digit })
  }

  const handleDelete = () => {
    if (!disabled) dispatch({ type: 'DELETE_DIGIT' })
  }

  const handleSubmit = () => {
    if (!disabled && input.length > 0) dispatch({ type: 'SUBMIT_ANSWER' })
  }

  const digitButton = (digit: string) => (
    <button
      key={digit}
      onPointerDown={(e) => {
        e.preventDefault()
        handleDigit(digit)
      }}
      disabled={disabled}
      className="w-16 h-16 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400
                 active:scale-95 text-white text-2xl font-bold
                 transition-all duration-75 select-none
                 disabled:opacity-40 disabled:active:scale-100"
    >
      {digit}
    </button>
  )

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Answer display */}
      <div className="w-52 h-14 rounded-xl bg-indigo-950/60 border-2 border-indigo-400/30
                      flex items-center justify-center text-3xl font-mono font-bold text-white
                      mb-1">
        {input || <span className="text-indigo-400/40">?</span>}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digitButton)}

        {/* Delete button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          disabled={disabled || input.length === 0}
          className="w-16 h-16 rounded-xl bg-rose-700 hover:bg-rose-600 active:bg-rose-500
                     active:scale-95 text-white text-xl font-bold
                     transition-all duration-75 select-none
                     disabled:opacity-40 disabled:active:scale-100"
        >
          ←
        </button>

        {digitButton('0')}

        {/* Submit button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          disabled={disabled || input.length === 0}
          className="w-16 h-16 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400
                     active:scale-95 text-white text-xl font-bold
                     transition-all duration-75 select-none
                     disabled:opacity-40 disabled:active:scale-100"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
