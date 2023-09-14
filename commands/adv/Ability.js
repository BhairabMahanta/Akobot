class Ability {
  constructor(name, description, executeFunction) {
    this.name = name;
    this.description = description;
    this.execute = executeFunction;
  }

  performAction(user, target) {
    this.execute(user, target);
  }
}

module.exports = Ability;
