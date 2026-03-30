import { uploadFileToCloudinary } from "../Config/cloudinaryconfig.js";
import Status from "../Models/Status.model.js";
import response from "../Utils/responseHandler.js";

export const createStatus = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const userId = req.user._id;
        const file = req.file;

        let mediaUrl = null;
        let finalContentType = contentType || 'text';

        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);

            if (!uploadFile?.secure_url) {
                return response(res, 400, 'failed to upload media')
            }
            mediaUrl = uploadFile?.secure_url;
            if (file.mimetype.startsWith('image')) {
                finalContentType = 'image';
            }
            else if (file.mimetype.startsWith("video")) {
                finalContentType = 'video'
            }
            else {
                return response(res, 400, "Unsupported file type")
            }
        }
        else if (content?.trim()) {
            finalContentType = "text"
        }
        else {
            return response(res, 400, "status content is required")
        }
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const status = new Status({
            user: userId,
            content: mediaUrl || content,
            contentType: finalContentType,
            expiresAt
        });

        await status.save();

        const populateStatus = await Status.findOne(status?._id)
            .populate("user", "username profilePicture")
            .populate("viewers", "username prrofilePicture");

        if (req.io && req.socketUserMap) {
            for (const [connectionUserId, socketId] of req.socketUserMap) {
                if (connectionUserId !== userId) {
                    req.io.to(socketId).emit("new_status", populateStatus)
                }
            }
        }

        return response(res, 201, "status created successfully", populateStatus);


    } catch (error) {
        console.error(error)
        return response(res, 500, 'status creation failed')
    }
}

export const getStatus = async (req, res) => {
    try {
        const statuses = await Status.find({
            expiresAt: { $gt: new Date() }
        }).
            populate("user", "username profilePicture")
            .populate("viewers", "username prrofilePicture")
            .sort({ createdAt: -1 });

        return response(res, 200, "status retrived successfully", statuses);

    } catch (error) {
        console.error(error)
        return response(res, 500, 'status creation failed')
    }
}

export const viewStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user._id;

    try {
        const status = await Status.findById(statusId);
        if (!status) {
            return response(res, 404, "Status not found");
        }
        if (!status.viewers.includes(userId)) {
            status.viewers.push(userId);
            await status.save();



            const updateStatus = await Status.findById(statusId)
                .populate("user", "username profilePicture")
                .populate("viewers", "username prrofilePicture");

            if (req.io && req.socketUserMap) {

                const statusOwnerSocketId = req.socketUserMap.get(status.user._id.toString());
                if (statusOwnerSocketId) {
                    const viewData = {
                        statusId,
                        viewerId: userId,
                        totalViewer: updateStatus.viewers.length,
                        viewers: updateStatus.viewers
                    }

                    req.io.to(statusOwnerSocketId).emit("status_viewed", viewData)
                }
                else {
                    console.log("status owner are not connected")
                }

            }

        }
        else {
            console.log("user already viewed the status")
        }
        return response(res, 200, "status viewed successfully");
    } catch (error) {
        console.error(error)
        return response(res, 500, 'status viewed failed')
    }
}

export const deleteStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user._id;
    try {
        const status = await Status.findById(statusId);
        if (!status) {
            return response(res, 404, "Status not found");
        }
        if (status.user.toString() !== userId) {
            return response(res, 403, "Not authorized to delete this status")
        }
        await status.deleteOne();

        if (req.io && req.socketUserMap) {
            for (const [connectionUserId, socketId] of req.socketUserMap) {
                if (connectionUserId !== userId) {
                    req.io.to(socketId).emit("status_deleted", statusId)
                }
            }
        }

        return response(res, 200, "status deleted successfully")
    } catch (error) {
        console.error(error)
        return response(res, 500, 'status delete failed')
    }

}