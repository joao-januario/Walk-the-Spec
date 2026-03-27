#!/bin/bash

source ./config.sh
source ./utils.sh

start_server() {
    local port=$1
    echo "Starting on $port"
}

get_user() {
    local id=$1
    echo "User $id"
}

initialize_db() {
    echo "DB initialized"
}

cleanup() {
    echo "Cleanup done"
}
