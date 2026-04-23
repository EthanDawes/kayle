import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://api.hfs.purdue.edu/menus/v3/GraphQL",
  documents: ["src/lib/integrations/*.gql"],
  generates: {
    "./src/lib/integrations/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-graphql-request"],
    },
  },
  ignoreNoDocuments: true,
}

export default config
