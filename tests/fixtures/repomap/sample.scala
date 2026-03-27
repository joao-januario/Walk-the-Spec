import scala.collection.mutable
import scala.io.Source

class UserService(db: Database) {
  def getUser(id: Int): Option[User] = {
    db.find(id)
  }

  def listUsers(): List[User] = {
    db.all()
  }
}

object AppConfig {
  val port: Int = 8080
  val host: String = "localhost"
}

trait Repository {
  def save(entity: Any): Unit
  def find(id: Int): Option[Any]
}

def createApp(config: AppConfig): UserService = {
  new UserService(new Database())
}

val defaultTimeout: Int = 30
