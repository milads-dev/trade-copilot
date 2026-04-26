module.exports = {
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "^react(.*)",
    "^next(.*)",
    "<THIRD_PARTY_MODULES>",
    "^@",
    "^[a-zA-Z0-9-]+",
    "^[./]",
  ],
  tailwindConfig: "./tailwind.config.ts",
};
