import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ⚠️ 关键点 1：这里必须填你的 GitHub 仓库名
  // 如果你的仓库叫 hr-insight-jobs，就不用改
  // 如果叫别的，就把中间这段换掉
  base: '/hr-insight-jobs/', 

  resolve: {
    alias: {
      // ⚠️ 关键点 2：这里要把 @ 指向 src 目录，配合 tsconfig 使用
      '@': path.resolve(__dirname, './src'),
    },
  },
});