const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', '..', 'proto', 'users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition).users;

const usersClient = new usersProto.UsersService(
  process.env.USERS_SERVICE_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
);

// Promisification simple des appels gRPC pour pouvoir utiliser async/await
function promisify(method) {
  return (request) =>
    new Promise((resolve, reject) => {
      usersClient[method](request, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
}

module.exports = {
  createUser: promisify('CreateUser'),
  getUser: promisify('GetUser'),
  listUsers: promisify('ListUsers'),
  updateUser: promisify('UpdateUser'),
  deleteUser: promisify('DeleteUser'),
};
