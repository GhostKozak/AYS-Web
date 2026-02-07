/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // test fonksiyonlarını (describe, it, expect) import etmeden kullanmak için
    environment: 'jsdom', // Tarayıcı ortamını simüle eder
    setupFiles: './src/setupTests.ts', // Her testten önce çalışacak ayar dosyası
    css: true, // CSS importlarını işlemesi için
  },
})
