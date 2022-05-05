function createResponse(success, errors, data, errorType) {
    return {
        success,
        errors,
        data,
        errorType
    };
}

function errorResponse(error) {
    let errorMessage = 'InternalError';
    let statusCode = 500;
    if (error instanceof ServerError) {
        errorMessage = error.clientError;
        statusCode = error.statusCode;
    }
    const response = createResponse(false, [errorMessage]);
    return { statusCode, response };
}

class ServerError extends Error {
    constructor(internalError, statusCode, clientError) {
        super(internalError);
        this.statusCode = statusCode || 500;
        this.clientError = clientError || internalError;
    }
}

function isDuplicateKeyError(error) {
    return /E11000 duplicate key/.test(error);
}

function verifyRequestSchema(controller, schemaValidator) {
    return async (req, res, next) => {
        try {
            await Promise.all(
                Object.keys(validationTypes).map(async (validationType) => {
                    if (schemaValidator && schemaValidator[validationType]) {
                        req[validationType] = await schemaValidator[validationType].validateAsync(
                            req[validationType],
                            {
                                stripUnknown: true
                            }
                        );
                    }
                })
            );
            controller(req, res, next);
        } catch (error) {
            if (error.isJoi) {
                res.status(400).json(
                    createResponse(
                        false,
                        error.details.map((detail) => detail.message),
                        null,
                        'ValidationError'
                    )
                );
            } else {
                req.log.error(error);
                res.status(500).json(
                    createResponse(false, ['Unknown Error'], null, ['Internal Error'])
                );
            }
        }
    };
}
const validationTypes = {
    body: 'body',
    params: 'params',
    query: 'query',
    headers: 'headers'
};

module.exports = {
    createResponse,
    errorResponse,
    isDuplicateKeyError,
    ServerError,
    verifyRequestSchema
};