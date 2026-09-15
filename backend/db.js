// Include Sequelize module
const {Sequelize} = require('sequelize')

const sequelize = new Sequelize(
  'machine_task',
  'root',
  '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  dialectOptions: {
    multipleStatements: true,
    typeCast: true,
    dateStrings: true,
  }
}
);

async function testConnection(){
 try {
  await sequelize.authenticate();
  console.log('db is connected successfully....')
 } catch (err) {
  console.log(err)
 }
}

testConnection();

module.exports = sequelize