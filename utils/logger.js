const fs = require("fs");
const path = require("path");

const logToFile = (method, url, statusCode, errorMessage) => {
	const date = new Date();
	const formattedDate = date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
	const logDir = path.join(__dirname, "../logs"); // Directory to store log files
	const logFilePath = path.join(logDir, `${formattedDate}.log`); // Log file path based on the date

	// Create the logs directory if it doesn't exist
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, {recursive: true}); // Ensure that subdirectories are created
	}

	// Prepare log message
	const logMessage = `✨${new Date().toLocaleString(
		"he-IL",
	)}✨ ${method} ${url} - Status Code: ${statusCode} - Error: ${errorMessage}\n`;

	// Append the log message to the file
	fs.appendFile(logFilePath, logMessage, (err) => {
		if (err) {
			console.error("Error writing to log file:", err);
		}
	});
};

// Logger middleware
const logger = (req, res, next) => {
	const originalSend = res.send;
	const startTime = Date.now();

	res.send = function (body) {
		const timeTaken = Date.now() - startTime;

		if (res.statusCode >= 400) {
			logToFile(req.method, req.url, res.statusCode, body); // Log error details
		} else {
			const accessLogMessage = `✨${new Date().toLocaleString("he-IL")}✨ | ${
				req.method
			} ${req.url} | Status: ${res.statusCode} | ${timeTaken}ms\n`;

			// Ensure the "access" directory exists before appending logs
			const accessDir = path.join(__dirname, "../access");

			if (!fs.existsSync(accessDir)) {
				fs.mkdirSync(accessDir, {recursive: true});
			}

			fs.appendFile(
				path.join(accessDir, `${new Date().toISOString().split("T")[0]}.log`),
				accessLogMessage,
				(err) => {
					if (err) console.error("Error logging access:", err);
				},
			);
		}

		originalSend.call(this, body); // Continue normal response flow
	};
	console.log(req.method + req.url);
	next();
};

module.exports = {logger, logToFile};
