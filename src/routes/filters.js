function allowUsers({ user: { role, id }, params: { idUser } }) {
  return ["admin", "main-admin"].includes(role) || id === idUser;
}

function allowUsersV2({ user: { role } }) {
  return ["admin", "main-admin", "customer"].includes(role);
}

function allowAdmin({ user: { role } }) {
  return ["admin", "main-admin"].includes(role);
}

function allowMain({ user: { role } }) {
  return role === "main-admin";
}

function allowSelf({ user: { id }, params: { idUser } }) {
  return id === idUser;
}

function denySelf({ user: { id }, params: { idUser } }) {
  return id !== idUser;
}

module.exports = {
  allowUsers,
  allowAdmin,
  allowMain,
  allowSelf,
  denySelf,
};
