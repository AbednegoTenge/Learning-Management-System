import Student from '../models/studentModel.js';
import Teacher from '../models/teacherModel.js';
import { dblogger } from '../logger.js';
import authController, { getModelByRole } from './authController.js';
import { generateRefreshToken } from '../../utils/refreshToken.js'; 

const accountController = {
    async getAccountDetails(req, res) {
        try {
            const { role, userId } = req.params;
            const Model = getModelByRole(role);

            // Fetch user details based on role
            const user = await Model.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            dblogger.info(`Fetched account details for ${role}: Email: ${user.email}`);
            // Return user details excluding sensitive information
            const { password, ...userDetails } = user.get({ plain: true });
            return res.status(200).json({ user: userDetails });
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
            dblogger.error(`Error fetching account details: ${error.message}`, { stack: error.stack });
        }
    },

    async updateProfile(req, res) {
        try {
            const { role, userId } = req.params;
            // get the model based on role
            const Model = getModelByRole(role);
            // find user
            const user = await Model.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // get the user details from the request body. remove id and password from the body
            const { id, password, ...updateData } = req.body;
            // update the user by id
            await Model.update(updateData);

            dblogger.info(`Updated profile for ${role}: Email: ${user.email}`);
            const updatedUser = await user.get({ plain: true });
            // return the updated user details excluding sensitive information
            const { password: _, ...userDetails } = updatedUser;
            return res.status(200).json({ message: 'Profile updated successfully', user: userDetails });
        } catch (error) {
            dblogger.error(`Error updating profile: ${error.message}`, { stack: error.stack });
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },

    async changePassword(req, res) {
        try {
            const { role, userId } = req.params;
            const { currentPassword, newPassword } = req.body;
            // get the model based on role
            const Model = getModelByRole(role);
            // find user
            const user = await Model.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // check if current password is correct
            const isPasswordValid = await bcrypt.compare(user.password, currentPassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid current password' });
            }
            // hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            // update the user's password
            await Model.update({ password: hashedNewPassword }, { where: { id: userId } });

            dblogger.info(`Password changed for ${role}: Email: ${user.email}`);
            return res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            dblogger.error(`Error changing password: ${error.message}`, { stack: error.stack });
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },

    async forgetPassword(req, res) {
        try {
            const { email} = req.body;
            // find user by email
            let user = await Student.findOne({ where: { email } });
            let role = 'student';
            if (!user) {
               user = await Teacher.findOne({ where: { email } });
               role = 'teacher'; 
            }

            const { token, hashedToken, expiresAt } = generateRefreshToken;
            // store token in redis
            await redisClient.setEx(`resetToken:${hashedToken}`, 15 * 60, JSON.stringify({ userId: user.id, role }));
            const resetLink = `http://localhost:3000/reset-password?token=${token}`;
            // send email with reset link
        } catch (error) {
            dblogger.error(`Error: ${error.message}`, { stack: error.stack });
            return res.status(500).json({ message: 'Error processing request' });
        }
    }
};

export default authController;