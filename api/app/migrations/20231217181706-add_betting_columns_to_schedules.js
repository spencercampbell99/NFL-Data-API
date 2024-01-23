'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // add columns
    await queryInterface.addColumn('schedules', 'spread', {type: Sequelize.FLOAT, allowNull: true});
    await queryInterface.addColumn('schedules', 'over_under', {type: Sequelize.FLOAT, allowNull: true});
    await queryInterface.addColumn('schedules', 'home_moneyline', {type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.addColumn('schedules', 'away_moneyline', {type: Sequelize.INTEGER, allowNull: true});
  },

  async down (queryInterface, Sequelize) {
    // remove columns
    await queryInterface.removeColumn('schedules', 'spread');
    await queryInterface.removeColumn('schedules', 'over_under');
    await queryInterface.removeColumn('schedules', 'home_moneyline');
    await queryInterface.removeColumn('schedules', 'away_moneyline');
  }
};
