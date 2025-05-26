'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Votes"
      ADD CONSTRAINT votes_pkey PRIMARY KEY ("user_id", "post_id")
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Votes"
      DROP CONSTRAINT votes_pkey
    `);
  }
};