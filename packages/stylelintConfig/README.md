## 💻 安装使用

- 安装依赖
```bash
pnpm install @manpao/stylelint stylelint -w
```

- 配置文件
根目录创建`stylelint.config.mjs`文件：
```ts
export default {
  extends: ['@manpao/stylelint'],
  root: true,
};
```
