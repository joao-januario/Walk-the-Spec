open Belt
open Js.Promise

let getUser = (id) => {
  Js.log("Getting user")
}

let createApp = (config) => {
  Js.log("Creating app")
}

type user = {
  id: int,
  name: string,
}

type config = {
  port: int,
  host: string,
}

module UserService = {
  let find = (id) => Js.log("Finding")
  let listAll = () => Js.log("Listing")
}
