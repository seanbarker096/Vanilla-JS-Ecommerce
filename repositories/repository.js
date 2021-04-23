const fs = require('fs');
const crypto = require('crypto');

//parent respository for products and user data
module.exports = class Repository {

  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a respository requires a filename");
    }

    this.filename = filename;
    //check if file exists
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      //if doesnt exist create file with empty array
      fs.writeFileSync(this.filename, "[]");
    }
  }

  async create(attrs) {
    const records = await this.getAll();
    //push new item into array and re-write to file
    attrs.id = this.randomId();
    records.push(attrs);
    await this.writeAll(records);

    return attrs;
  }

  async getAll() {
    //open the file called this.filename
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
  }

  async writeAll(records) {
    //write database to file
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    //return only those entries which dont have the delete id
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    //if record doesnt exist throw error
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }
    //copy attrs props onto record object
    Object.assign(record, attrs);
    //dont need to re-add record to records as record is a reference type,
    //hence have already updated the records array too
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();
    for (let record of records) {
      let found = true;
      for (let key in filters) {
        //if value in filters object matches that in record for given key (e.g. email)
        //set found to false and break
        if (record[key] !== filters[key]) {
          found = false;
          break;
        }
      }
      if (found) {
        return record;
      }
    }
  }
}
