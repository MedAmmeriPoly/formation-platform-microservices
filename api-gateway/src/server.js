const express = require('express');
const cors = require('cors');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');

const usersRoutes = require('./routes/usersRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const enrollmentsRoutes = require('./routes/enrollmentsRoutes');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

async function main() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // --- Routes REST ---
  app.use('/api/users', usersRoutes);
  app.use('/api/courses', coursesRoutes);
  app.use('/api/enrollments', enrollmentsRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  // --- Serveur GraphQL ---
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  app.use('/graphql', expressMiddleware(apolloServer));

  const PORT = process.env.GATEWAY_PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`API Gateway en ecoute sur http://localhost:${PORT}`);
    console.log(`  - REST    : http://localhost:${PORT}/api/{users|courses|enrollments}`);
    console.log(`  - GraphQL : http://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error('Erreur au demarrage de l\'API Gateway:', err);
  process.exit(1);
});
