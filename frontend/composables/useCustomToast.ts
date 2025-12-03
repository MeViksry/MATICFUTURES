export const useCustomToast = () => {
  const toasts = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>>('toasts', () => [])

  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(7)
    toasts.value.push({ id, type, title, message })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, message: string = '') => {
    addToast('success', title, message)
  }

  const error = (title: string, message: string = '') => {
    addToast('error', title, message)
  }

  const warning = (title: string, message: string = '') => {
    addToast('warning', title, message)
  }

  const info = (title: string, message: string = '') => {
    addToast('info', title, message)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}