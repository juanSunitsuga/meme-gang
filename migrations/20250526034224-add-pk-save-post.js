'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Saved_Posts"
      ADD CONSTRAINT saved_post_pkey PRIMARY KEY ("user_id", "post_id")
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Saved_Posts"
      DROP CONSTRAINT saved_post_pkey
    `);
  }
};
