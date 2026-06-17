const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const userService = require('./userService');
const { startConsumer } = require('./kafkaConsumer');
const kafkaProducer = require('./kafkaProducer');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition).users;

// --- Implementation des methodes RPC ---

function CreateUser(call, callback) {
  try {
    const { full_name, email, password, role } = call.request;

    if (!full_name || !email || !password) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'full_name, email et password sont obligatoires',
      });
    }

    const user = userService.createUser({ full_name, email, password, role });

    // Publication asynchrone de l'evenement Kafka (ne bloque pas la reponse gRPC)
    kafkaProducer.publishUserRegistered(user).catch((err) => {
      console.error('[Kafka] Erreur publication user.registered:', err.message);
    });

    callback(null, { success: true, message: 'Utilisateur cree avec succes', user });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return callback({
        code: grpc.status.ALREADY_EXISTS,
        message: 'Un utilisateur avec cet email existe deja',
      });
    }
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function GetUser(call, callback) {
  try {
    const user = userService.getUserById(call.request.id);
    if (!user) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Utilisateur introuvable' });
    }
    callback(null, { success: true, message: 'OK', user });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function ListUsers(call, callback) {
  try {
    const { role_filter, has_role_filter, page, page_size } = call.request;
    const roleFilterStr = has_role_filter ? (role_filter === 1 ? 'INSTRUCTOR' : 'STUDENT') : null;

    const { users, total } = userService.listUsers({
      roleFilter: roleFilterStr,
      page: page || 1,
      pageSize: page_size || 20,
    });

    callback(null, { success: true, users, total });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function UpdateUser(call, callback) {
  try {
    const user = userService.updateUser(call.request);
    if (!user) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Utilisateur introuvable' });
    }
    callback(null, { success: true, message: 'Utilisateur mis a jour', user });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function DeleteUser(call, callback) {
  try {
    const deleted = userService.deleteUser(call.request.id);
    if (!deleted) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Utilisateur introuvable' });
    }
    callback(null, { success: true, message: 'Utilisateur supprime' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

// --- Demarrage du serveur ---

function main() {
  const server = new grpc.Server();

  server.addService(usersProto.UsersService.service, {
    CreateUser,
    GetUser,
    ListUsers,
    UpdateUser,
    DeleteUser,
  });

  const PORT = process.env.PORT || '50051';
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Users service en ecoute sur le port ${PORT}`);
  });

  // Demarrage du consommateur Kafka en parallele (ne bloque pas le serveur gRPC)
  startConsumer().catch((err) => {
    console.error('[Kafka] Erreur demarrage consommateur:', err.message);
  });
}

main();
