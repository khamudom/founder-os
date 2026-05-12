import './Toast.css'

export type ToastProps = {
  message: string
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="fo-toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}
