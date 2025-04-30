'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'profilePicture', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('Users', 'name', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('Users', 'bio', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'profilePicture');
        await queryInterface.removeColumn('Users', 'name');
        await queryInterface.removeColumn('Users', 'bio');
    },
};