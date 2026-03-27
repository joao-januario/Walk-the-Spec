#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    char* name;
} UserData;

struct Config {
    int port;
    char* host;
};

enum Status {
    ACTIVE,
    INACTIVE,
    DELETED
};

void start_server(int port) {
    printf("Starting on %d\n", port);
}

int get_user_count(void) {
    return 42;
}

static void internal_init(void) {
    // private helper
}
