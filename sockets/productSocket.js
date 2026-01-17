const Products = require("../models//Product");

module.exports = (io, socket) => {
	socket.on("product:read", async (productId) => {
		try {
			if (!productId) {
				socket.emit("product:error", "product ID is required");
				return;
			}
			const product = await Products.findById(productId);
			if (!product) {
				socket.emit("product:error", "product not found");
			} else {
				socket.emit("product:details", product);
			}
		} catch (error) {
			socket.emit("order:error", error.message);
		}
	});
};
