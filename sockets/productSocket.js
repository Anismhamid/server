const Post = require("../models/post");

module.exports = (io, socket) => {
	socket.on("product:read", async (postId) => {
		try {
			if (!postId) {
				socket.emit("product:error", "post ID is required");
				return;
			}
			const post = await Post.findById(postId);
			if (!post) {
				socket.emit("product:error", "product not found");
			} else {
				socket.emit("product:details", post);
			}
		} catch (error) {
			socket.emit("product:error", error.message);
		}
	});
};
