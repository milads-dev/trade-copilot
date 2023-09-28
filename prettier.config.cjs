module.exports = {
  plugins: [require.resolve("prettier-plugin-tailwindcss"),require.resolve("@trivago/prettier-plugin-sort-imports")],
  "importOrder": ["^react(.*)", "^next(.*)", "<THIRD_PARTY_MODULES>", "@/(.*)", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}

