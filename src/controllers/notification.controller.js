import { Notification } from '../models/notification.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json(new apiResponse(200, notifications, 'Notifications fetched'));
});

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) throw new apiError(404, 'Notification not found');
    if (notification.userId.toString() !== req.user._id.toString()) {
        throw new apiError(403, 'Unauthorized');
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(new apiResponse(200, notification, 'Marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    return res.status(200).json(new apiResponse(200, {}, 'All notifications marked as read'));
});

export { getNotifications, markAsRead, markAllAsRead };
