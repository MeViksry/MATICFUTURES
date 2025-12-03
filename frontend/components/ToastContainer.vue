<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-full"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="p-4 rounded-xl shadow-lg flex items-start gap-3"
        :class="toastClasses[toast.type]"
      >
        <div class="flex-shrink-0">
          <component :is="toastIcons[toast.type]" class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-sm">{{ toast.title }}</h4>
          <p v-if="toast.message" class="text-sm opacity-90 mt-1">{{ toast.message }}</p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useCustomToast()

const toastClasses: Record<string, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white'
}

const toastIcons: Record<string, any> = {
  success: resolveComponent('IconCheck'),
  error: resolveComponent('IconX'),
  warning: resolveComponent('IconWarning'),
  info: resolveComponent('IconInfo')
}
</script>