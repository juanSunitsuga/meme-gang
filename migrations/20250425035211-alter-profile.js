'use strict';

/** @type {import('sequelize-cli').Migration} */
export default{
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'profilePicture', {
      type: Sequelize.STRING,
      allowNull: true, 
    });

    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false, 
    });

    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'profilePicture');
    await queryInterface.removeColumn('users', 'name');
    await queryInterface.removeColumn('users', 'bio');
  }
};