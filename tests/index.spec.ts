import { buildSchema, parse } from 'graphql'
import { plugin } from '../src/index'

type CodegenTestCase = [
  string,
  {
    textSchema: string
    operators: string[]
    wantContains: string | string[]
  }
]

describe.skip('graphql', () => {
  it.each<CodegenTestCase>([
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
        operators: [
          /* GraphQL */ `
            query test {
              feed {
                id
                commentCount
                repository {
                  full_name
                  html_url
                  owner {
                    avatar_url
                  }
                }
              }
            }
          `,
        ],
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
    const docs = operators.map(z => parse(z)).map(document => ({ location: '', document }))
    const result = await plugin(schema, docs, {})

    for (const wantContain of wantContains) expect(result.content).toContain(wantContain)
  })
})
