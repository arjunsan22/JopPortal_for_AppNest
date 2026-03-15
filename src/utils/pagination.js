// src/utils/pagination.js
export const getPaginationOptions = (req) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const createPaginatedResponse = (data, totalDocuments, page, limit) => {
    const totalPages = Math.ceil(totalDocuments / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        data,
        pagination: {
            totalDocuments,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage,
            hasPrevPage
        }
    };
};
