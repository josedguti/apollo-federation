const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const fetch = require("node-fetch");

const port = 4002;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
  type User {
    id: ID!
    task: [Todo]
    name: String!
    email: String
  }

  extend type Todo @key(fields: "id") {
    id: ID! @external
    users: [User]
  }

  extend type Query {
    user(id: ID!): User
    users: [User]
  }
`;

const resolvers = {
  Todo: {
    async users(todo) {
      const res = await fetch(`${apiUrl}/users`);
      const users = await res.json();

      return users.filter(({ task }) => task.includes(parseInt(todo.id)));
    },
  },
  User: {
    task(user) {
      return user.task.map((id) => ({ __typename: "Todo", id }));
    },
  },
  Query: {
    user(_, { id }) {
      return fetch(`${apiUrl}/users/${id}`).then((res) => res.json());
    },
    users() {
      return fetch(`${apiUrl}/users`).then((res) => res.json());
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Users service ready at ${url}`);
});
