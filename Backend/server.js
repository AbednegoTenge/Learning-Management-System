import express from 'express';
import dotenv from 'dotenv';
import { generalLogger } from './logger.js';
import './models/studentModel.js';
import './models/teacherModel.js';
import './models/courseModel.js';
import './models/studentCourseModels.js';
import sequelize from './config/sequelize.js';

dotenv.config();

try {
    const app = express();
    const PORT = process.env.PORT || 3000;
    

    // Initialize Sequelize
    sequelize.sync({ force: false })
        .then(() => {
            generalLogger.info('Database synchronized successfully');
        })
        .catch((error) => {
            generalLogger.error(`Error synchronizing database: ${error.message}`, { stack: error.stack });
        });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    

    app.listen(PORT, () => {
        generalLogger.info(`Server is running on port ${PORT}`);
    });
} catch (error) {
    generalLogger.error(`Error starting the server: ${error.message}`, { stack: error.stack });
}
