open Printf
open Stdlib

let get_user id =
  Printf.printf "Getting user %d\n" id

let create_app config =
  Printf.printf "Creating app\n"

type user = {
  id: int;
  name: string;
}

type config = {
  port: int;
  host: string;
}

module UserService = struct
  let find id = Printf.printf "Finding %d\n" id
  let list_all () = Printf.printf "Listing all\n"
end
