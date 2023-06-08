import { buildSchema } from 'graphql'
import { plugin } from '../src/index'

type CodegenTestCase = [
  string,
  {
    textSchema: string
    operators: string | string[]
    wantContains: string | string[]
  }
]

describe('graphql', () => {
  test.each<CodegenTestCase>([
    [
      'query',
      {
        textSchema: /* GraphQL */ `
          type Query {
            getCompanies(pagination: PaginationInput): [CompanyOutput!]!
          }

          input PaginationInput {
            skip: Int
            take: Int
          }

          type CompanyOutput {
            name: String
            address: String
          }
        `,
        operators: [],
        wantContains: [
          'export function PrimitiveInputSchema(): myzod.Type<PrimitiveInput> {',
          'a: myzod.string()',
          'b: myzod.string()',
          'c: myzod.boolean()',
          'd: myzod.number()',
          'e: myzod.number()',
        ],
      },
    ],
  ])('%s', async (_, { textSchema, operators, wantContains }) => {
    const schema = buildSchema(textSchema)
    const result = await plugin(schema, [], {}, {})
    expect(result).toContain("import * as myzod from 'myzod'")

    for (const wantContain of wantContains) {
      expect(result.content).toContain(wantContain)
    }
  })
})
