const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, maxlength: 150 },
		slug: { type: String, required: true, unique: true },
		excerpt: { type: String, maxlength: 300, default: "" },
		content: { type: String, required: true }, // Markdown
		coverImage: { type: String, default: "" },
		tags: { type: [String], default: [], index: true },
		authorName: { type: String, default: "" },
		status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
		publishedAt: { type: Date },
		views: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

blogPostSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);