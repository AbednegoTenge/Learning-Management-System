import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Course extends Model {}

Course.init({
    id: {
        type: DataTypes.INTEGER,
        primarykey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Courses',
    tableName: 'course'
});

export default Course;