import kotlin.collections.List
import kotlin.io.println

class UserService(private val db: Database) {
    fun getUser(id: Int): User? {
        return db.find(id)
    }

    fun listUsers(): List<User> {
        return db.all()
    }

    private fun validate(id: Int): Boolean {
        return id > 0
    }
}

object AppConfig {
    val port = 8080
    val host = "localhost"
}

fun createApp(config: AppConfig): UserService {
    return UserService(Database())
}

data class User(val id: Int, val name: String)
