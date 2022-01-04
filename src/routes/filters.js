function allowUsers(req) {
  const {
    user: { role },
  } = req;

  return ["admin", "main-admin", "customer"].includes(role);
}

function allowAdmin(req) {
  const {
    user: { role },
  } = req;

  return ["admin", "main-admin"].includes(role);
}

function allowMain(req) {
  const {
    user: { role },
  } = req;

  return role === "main-admin";
}

function allowSelf(req) {
  const {
    user: { id },
    params: { idUser },
  } = req;

  return id === idUser;
}

function allowSelfInQuery(req) {
  const {
    user: { id },
    query: { user: idUser },
  } = req;

  return id === idUser;
}

function denySelf(req) {
  const {
    user: { id },
    params: { idUser },
  } = req;

  return id !== idUser;
}

function denySelfInQuery(req) {
  const {
    user: { id },
    query: { user: idUser },
  } = req;

  return id !== idUser;
}

module.exports = {
  allowUsers,
  allowAdmin,
  allowMain,
  allowSelf,
  allowSelfInQuery,
  denySelf,
  denySelfInQuery,
};
