import 'dart:async';
import 'package:http/http.dart' as http;

class UserService {
  final Database db;

  UserService(this.db);

  Future<User?> getUser(int id) async {
    return db.find(id);
  }

  Future<List<User>> listUsers() async {
    return db.all();
  }
}

enum UserRole {
  admin,
  user,
  guest,
}

void createApp(Map<String, dynamic> config) {
  // setup
}

String _internalHelper() {
  return 'helper';
}
