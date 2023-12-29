'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // add columns
    await queryInterface.addColumn('schedules', 'spread', {type: Sequelize.FLOAT, allowNull: true});
    await queryInterface.addColumn('schedules', 'over_under', {type: Sequelize.FLOAT, allowNull: true});
    await queryInterface.addColumn('schedules', 'home_team_money_line', {type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.addColumn('schedules', 'away_team_money_line', {type: Sequelize.INTEGER, allowNull: true});
  },

  async down (queryInterface, Sequelize) {
    // remove columns
    await queryInterface.removeColumn('schedules', 'spread');
    await queryInterface.removeColumn('schedules', 'over_under');
    await queryInterface.removeColumn('schedules', 'home_team_money_line');
    await queryInterface.removeColumn('schedules', 'away_team_money_line');
  }
};
