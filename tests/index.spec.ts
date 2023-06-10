import { buildSchema, parse } from 'graphql'
import { plugin } from '@nerd-coder/graphql-codegen-svelte-queries'

describe('graphql', async () => {
  const testcase = {
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
          getCompanies {
            name
            address
          }
        }
      `,
    ],
  }

  const schema = buildSchema(testcase.textSchema)
  const docs = testcase.operators.map(z => parse(z)).map(document => ({ location: '', document }))
  const result = await plugin(schema, docs, { clientPath: './fakeClient.ts', clientType: 'apollo' })

  it('should import client', async () => {
    expect(result.prepend).contain(`import client from './fakeClient.ts'`)
  })

  it('should contains Doc', async () => {
    expect(result.content).toMatch(/^export const TestDoc = gql`$/gm)
  })

  it('should contains Query defination', async () => {
    expect(result.content).toMatch(
      /^export const test = \(options\?: ReadableQueryOption<TestQuery, TestQueryVariables>\)/gm
    )
  })
})
