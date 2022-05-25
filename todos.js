const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const fetch = require("node-fetch");

const port = 4001;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
  type Todo @key(fields: "id") {
    id: ID!
    title: String
    completed: Boolean
  }

  extend type Query {
    todo(id: ID!): Todo
    todos: [Todo]
  }
`;

const resolvers = {
  Todo: {
    __resolveReference(ref) {
      return fetch(`${apiUrl}/todos/${ref.id}`).then((res) => res.json());
    },
  },
  Query: {
    todo(_, { id }) {
      return fetch(`${apiUrl}/todos/${id}`).then((res) => res.json());
    },
    todos() {
      return fetch(`${apiUrl}/todos`).then((res) => res.json());
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Todos service ready at ${url}`);
});
