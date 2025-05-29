'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('Upvote_Downvote_Posts', 'Votes');

    await queryInterface.removeColumn('Votes', 'type');

    await queryInterface.addColumn('Votes', 'is_upvote', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Votes', 'type', {
      type: Sequelize.ENUM('Upvote', 'Downvote'),
      allowNull: false,
    });

    await queryInterface.removeColumn('Votes', 'is_upvote');

    await queryInterface.renameTable('Votes', 'Upvote_Downvote_Posts');
  }
};