import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Student extends Model {}

Student.init({
    id: {
        type: DataTypes.INTEGER,
        primarykey: true,
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
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    course: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize, 
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
});

export default Student;