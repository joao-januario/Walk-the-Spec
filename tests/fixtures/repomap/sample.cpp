#include <string>
#include <vector>

namespace app {

class UserService {
public:
    void getUser(int id);
    void deleteUser(int id);
private:
    void validate(int id);
};

struct Config {
    std::string host;
    int port;
};

enum class Role {
    Admin,
    User,
    Guest
};

void initialize(const Config& config) {
    // top-level function
}

} // namespace app
