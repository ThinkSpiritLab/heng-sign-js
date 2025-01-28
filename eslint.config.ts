import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config({
    extends: [
        js.configs.recommended,
        ...ts.configs.recommendedTypeChecked,
        ...ts.configs.stylisticTypeChecked,
    ],
    ignores: ["*.d.ts", "*.js"],
    languageOptions: {
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],
    },
});
