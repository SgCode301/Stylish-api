const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

class ImageCloudinaryController {
    constructor(model, config) {
        this.model = model;
        this.config = config;

        cloudinary.config({
            cloud_name: config.cloudinary.cloudName,
            api_key: config.cloudinary.apiKey,
            api_secret: config.cloudinary.apiSecret
        });

        // Internal multer setup
        this.upload = multer({ storage: multer.memoryStorage() }).single("file");
    }

    runMulterMiddleware = (req, res) => {
        return new Promise((resolve, reject) => {
            this.upload(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    hasRootAccess(user) {
        return this.config.rootAccessRoles?.includes(user.role);
    }

    uploadImage = async (req, res) => {
        try {
            await this.runMulterMiddleware(req, res);
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const userId = req.user._id;

            if (!req.file) {
                return res.status(400).send("No files were uploaded.");
            }

            const sharpQuality = this.config.quality?.sharpQuality;
            const cloudinaryQuality = this.config.quality?.cloudinaryQuality || "auto";
            const fileName = req.file.originalname;

            let buffer;

            if (typeof sharpQuality === "number" && sharpQuality >= 1 && sharpQuality <= 100) {
                buffer = await sharp(req.file.buffer)
                    .jpeg({ quality: sharpQuality })
                    .toBuffer();
            } else {
                buffer = req.file.buffer;
            }

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: "auto",
                        quality: cloudinaryQuality
                    },
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                ).end(buffer);
            });

            const imageUrl = result.url?.replace(/^http:\/\//i, "https://");

            const imageData = new this.model({
                image: imageUrl,
                publicId: result.public_id,
                alt: fileName,
                createdBy: userId
            });

            await imageData.save();

            return res.status(200).json({
                message: "Image uploaded successfully",
                data: imageData
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({
                message: "Image upload failed.",
                data: error
            });
        }
    };

    uploadImagePublic = async (req, res) => {
        try {
            await this.runMulterMiddleware(req, res);
            // if (!req.user || !req.user._id) {
            //     return res.status(401).json({ message: "Unauthorized" });
            // }
            // const userId = req.user._id;

            if (!req.file) {
                return res.status(400).send("No files were uploaded.");
            }

            const sharpQuality = this.config.quality?.sharpQuality;
            const cloudinaryQuality = this.config.quality?.cloudinaryQuality || "auto";
            const fileName = req.file.originalname;

            let buffer;

            if (typeof sharpQuality === "number" && sharpQuality >= 1 && sharpQuality <= 100) {
                buffer = await sharp(req.file.buffer)
                    .jpeg({ quality: sharpQuality })
                    .toBuffer();
            } else {
                buffer = req.file.buffer;
            }

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: "auto",
                        quality: cloudinaryQuality
                    },
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                ).end(buffer);
            });

            const imageUrl = result.url?.replace(/^http:\/\//i, "https://");

            const imageData = new this.model({
                image: imageUrl,
                publicId: result.public_id,
                alt: fileName
                // createdBy: userId
            });

            await imageData.save();

            return res.status(200).json({
                message: "Image uploaded successfully",
                data: imageData
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({
                message: "Image upload failed.",
                data: error
            });
        }
    };

    deleteFromCloudinary = async (req, res) => {
        try {
            const userId = req.user._id;
            const id = req.params.id;

            let query = { publicId: id };
            if (!this.hasRootAccess(req.user)) {
                query.createdBy = userId;
            }

            const imageDoc = await this.model.findOneAndDelete(query);
            if (!imageDoc) {
                return res.status(404).json({ message: "Image not found or access denied." });
            }

            const result = await cloudinary.uploader.destroy(id);
            return res.status(200).json({
                message: "Image deleted successfully",
                data: result
            });
        } catch (error) {
            return res.status(400).json({
                message: "Image deletion failed",
                data: error.message
            });
        }
    };

    getImages = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(
                parseInt(req.query.limit) || this.config.pagination.limit,
                this.config.pagination.maxLimit
            );
            const search = req.query.search || "";
            const skip = (page - 1) * limit;

            let query = {
                alt: { $regex: search, $options: "i" }
            };

            // if (!this.hasRootAccess(req.user)) {
            //     query.createdBy = req.user._id;
            // }

            const total = await this.model.countDocuments(query);
            const data = await this.model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

            return res.status(200).json({
                message: "Images fetched successfully",
                count: total,
                data
            });
        } catch (error) {
            return res.status(400).json({
                message: "Failed to fetch images",
                data: error
            });
        }
    };
}

module.exports = ImageCloudinaryController;
