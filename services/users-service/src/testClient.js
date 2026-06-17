const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition).users;
const client = new usersProto.UsersService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// 1. Creer un utilisateur
client.CreateUser(
  {
    full_name: 'Med Ammeri',
    email: 'test.ammeri@example.com',
    password: 'motdepasse123',
    role: 0, // STUDENT
  },
  (err, response) => {
    if (err) {
      console.error('Erreur CreateUser:', err.message);
      return;
    }
    console.log('CreateUser ->', response);

    const userId = response.user.id;

    // 2. Recuperer cet utilisateur par son id
    client.GetUser({ id: userId }, (err2, response2) => {
      if (err2) {
        console.error('Erreur GetUser:', err2.message);
        return;
      }
      console.log('GetUser ->', response2);
    });

    // 3. Lister tous les utilisateurs
    client.ListUsers({ page: 1, page_size: 10 }, (err3, response3) => {
      if (err3) {
        console.error('Erreur ListUsers:', err3.message);
        return;
      }
      console.log('ListUsers ->', response3);
    });
  }
);
