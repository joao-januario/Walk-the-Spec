import Ecto.Query
alias App.Repo
use GenServer

defmodule App.UserService do
  def get_user(id) do
    Repo.get(User, id)
  end

  def list_users do
    Repo.all(User)
  end

  defp validate(id) do
    id > 0
  end
end

defmodule App.Config do
  def default_port, do: 8080
end

def create_app(config) do
  App.UserService.start_link(config)
end
