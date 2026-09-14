const Post = require("../models/post");

module.exports = (io, socket) => {
	socket.on("post:read", async (postId) => {
		try {
			if (!postId) {
				socket.emit("product:error", "post ID is required");
				return;
			}
			const post = await Post.findById(postId);
			if (!post) {
				socket.emit("post:error", "post not found");
			} else {
				socket.emit("post:details", post);
			}
		} catch (error) {
			socket.emit("order:error", error.message);
		}
	});
};
