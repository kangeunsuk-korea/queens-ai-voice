import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 프로젝트의 기본적인 빌드 설정을 담당하는 파일입니다.
export default defineConfig({
  plugins: [react()],
})
