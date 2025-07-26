import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Teacher extends Model {}

Teacher.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    middleName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    hireDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize, 
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: true,
})

export default Teacher;