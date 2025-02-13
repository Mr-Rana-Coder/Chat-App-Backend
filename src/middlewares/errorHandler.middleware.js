const errorHandler = (err, req, res, next) => {
    if (err instanceof ReferenceError) {
        return res.status(500).json({
            success: false,
            message: `System Error: ${err.message}. Please contact support or try again later.`
        });
    }

    if (err.message && err.message.includes("not defined")) {
        return res.status(400).json({
            success: false,
            message: `Bad Request: ${err.message} is required or invalid.`
        });
    }

    if (err.message) {
        return res.status(400).json({
            success: false,
            message: `Error: ${err.message}`
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: "An unexpected error occurred. Please try again later."
    });
};


export {
    errorHandler
}