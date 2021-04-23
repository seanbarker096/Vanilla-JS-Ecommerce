const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(attrs) {
    attrs.id = this.randomId();

    const salt = crypto.randomBytes(8).toString("hex");
    const buf = await scrypt(attrs.password, salt, 64);
    const records = await this.getAll();
    const record = { ...attrs, password: `${buf.toString("hex")}.${salt}` };
    records.push(record);
    // write the updated records back to this.filename
    await this.writeAll(records);
    //return in case want to know new id of record
    return record;
  }

  async comparePasswords(saved, supplied) {
    const result = saved.split(".");
    const [hashed, salt] = saved.split(".");
    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString('hex');
  }
}

//export instance of class so dont have to enter filename
//means when create instances of this repo in different files
//we are sure to refer to the same users.json file
module.exports = new UsersRepository("users.json");
