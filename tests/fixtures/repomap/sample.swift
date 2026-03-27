import Foundation
import UIKit

public class UserService {
    public func getUser(id: Int) -> User? {
        return nil
    }

    private func validate(id: Int) -> Bool {
        return id > 0
    }
}

public protocol Repository {
    func save(entity: Any)
    func find(id: Int) -> Any?
}

public struct UserData {
    var id: Int
    var name: String
}

func internalHelper() -> Void {
    // not public
}

public func createApp(config: [String: Any]) -> UserService {
    return UserService()
}
