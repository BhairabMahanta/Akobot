class CooldownManager {
  constructor() {
    this.userDropCooldowns = new Map();
    this.userGrabCooldowns = new Map();
  }
}

module.exports = new CooldownManager();
