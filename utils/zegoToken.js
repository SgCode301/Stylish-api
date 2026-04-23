const { generateToken04 } = require("./zego_server_assistant"); // from local file

/**
 * Generate a ZEGOCLOUD Token
 * @param {string} userID - Unique user identifier
 * @param {string} roomID - Room identifier
 * @param {boolean} canPublish - Permission to publish stream
 * @param {boolean} canLogin - Permission to login to room
 * @param {array} streamIDs - Allowed stream IDs
 * @returns {string} token
 */
const createZegoToken = (userID, roomID, canPublish = true, canLogin = true, streamIDs = []) => {
    const appID = Number(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;
    const effectiveTimeInSeconds = Number(process.env.TOKEN_TTL || 3600);

    // Privilege payload
    const payload = {
        room_id: roomID,
        privilege: {
            1: canLogin ? 1 : 0,  // login room
            2: canPublish ? 1 : 0 // publish stream
        },
        stream_id_list: streamIDs
    };

    return generateToken04(appID, userID, serverSecret, effectiveTimeInSeconds, JSON.stringify(payload));
};

module.exports = { createZegoToken };
