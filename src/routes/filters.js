function allowUsers({ user: { role, id }, params: { idUser } }) {
  return (
    ["admin", "main-admin"].includes(role) ||
    (role === "customer" && id === idUser)
  );
}

function allowAdmin({ user: { role } }) {
  return ["admin", "main-admin"].includes(role);
}

function allowMain({ user: { role } }) {
  return role === "main-admin";
}

function denySelf({ user: { id }, params: { idUser } }) {
  return id !== idUser;
}

module.exports = {
  allowUsers,
  allowAdmin,
  allowMain,
  denySelf,
};
