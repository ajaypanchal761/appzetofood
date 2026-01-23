import Order from '../../order/models/Order.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Get all customer reviews (Admin)
 * GET /api/admin/reviews
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, restaurantId, rating, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query = {
      status: 'delivered',
      'review.rating': { $exists: true, $ne: null }
    };
    
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }
    
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        query['review.rating'] = ratingNum;
      }
    }
    
    // Sort options
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['review.rating'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'submittedAt') {
      sortOptions['review.submittedAt'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions['review.submittedAt'] = -1; // Default: newest first
    }
    
    // Fetch reviews with pagination
    const reviews = await Order.find(query)
      .populate('userId', 'name phone email')
      .populate('restaurantId', 'name')
      .select('orderId restaurantId restaurantName userId review deliveredAt createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get total count
    const totalReviews = await Order.countDocuments(query);
    
    // Calculate average rating
    const avgRatingResult = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$review.rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$review.rating'
          }
        }
      }
    ]);
    
    let avgRating = 0;
    let ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    if (avgRatingResult.length > 0) {
      avgRating = avgRatingResult[0].avgRating || 0;
      const distribution = avgRatingResult[0].ratingDistribution || [];
      distribution.forEach(rating => {
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
        }
      });
    }
    
    return successResponse(res, 200, 'Reviews fetched successfully', {
      reviews: reviews.map(review => ({
        orderId: review.orderId,
        orderMongoId: review._id,
        restaurantId: review.restaurantId?._id || review.restaurantId,
        restaurantName: review.restaurantName || review.restaurantId?.name,
        customer: {
          id: review.userId?._id || review.userId,
          name: review.userId?.name,
          phone: review.userId?.phone,
          email: review.userId?.email
        },
        rating: review.review?.rating,
        comment: review.review?.comment,
        submittedAt: review.review?.submittedAt || review.deliveredAt,
        deliveredAt: review.deliveredAt,
        createdAt: review.createdAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalReviews / limitNum),
        totalReviews,
        limit: limitNum
      },
      statistics: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return errorResponse(res, 500, `Failed to fetch reviews: ${error.message}`);
  }
});

/**
 * Get review by order ID (Admin)
 * GET /api/admin/reviews/:orderId
 */
export const getReviewByOrderId = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      $or: [
        { orderId: orderId },
        { _id: orderId }
      ],
      status: 'delivered',
      'review.rating': { $exists: true, $ne: null }
    })
      .populate('userId', 'name phone email')
      .populate('restaurantId', 'name')
      .select('orderId restaurantId restaurantName userId review deliveredAt createdAt')
      .lean();
    
    if (!order) {
      return errorResponse(res, 404, 'Review not found for this order');
    }
    
    return successResponse(res, 200, 'Review fetched successfully', {
      orderId: order.orderId,
      orderMongoId: order._id,
      restaurantId: order.restaurantId?._id || order.restaurantId,
      restaurantName: order.restaurantName || order.restaurantId?.name,
      customer: {
        id: order.userId?._id || order.userId,
        name: order.userId?.name,
        phone: order.userId?.phone,
        email: order.userId?.email
      },
      rating: order.review?.rating,
      comment: order.review?.comment,
      submittedAt: order.review?.submittedAt || order.deliveredAt,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return errorResponse(res, 500, `Failed to fetch review: ${error.message}`);
  }
});

/**
 * Get reviews by restaurant ID (Admin)
 * GET /api/admin/reviews/restaurant/:restaurantId
 */
export const getReviewsByRestaurant = asyncHandler(async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 20, rating, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const query = {
      restaurantId: restaurantId,
      status: 'delivered',
      'review.rating': { $exists: true, $ne: null }
    };
    
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        query['review.rating'] = ratingNum;
      }
    }
    
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['review.rating'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions['review.submittedAt'] = sortOrder === 'asc' ? 1 : -1;
    }
    
    const reviews = await Order.find(query)
      .populate('userId', 'name phone email')
      .select('orderId userId review deliveredAt createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalReviews = await Order.countDocuments(query);
    
    const avgRatingResult = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$review.rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    const avgRating = avgRatingResult.length > 0 ? (avgRatingResult[0].avgRating || 0) : 0;
    
    return successResponse(res, 200, 'Restaurant reviews fetched successfully', {
      reviews: reviews.map(review => ({
        orderId: review.orderId,
        orderMongoId: review._id,
        customer: {
          id: review.userId?._id || review.userId,
          name: review.userId?.name,
          phone: review.userId?.phone,
          email: review.userId?.email
        },
        rating: review.review?.rating,
        comment: review.review?.comment,
        submittedAt: review.review?.submittedAt || review.deliveredAt,
        deliveredAt: review.deliveredAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalReviews / limitNum),
        totalReviews,
        limit: limitNum
      },
      statistics: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant reviews:', error);
    return errorResponse(res, 500, `Failed to fetch restaurant reviews: ${error.message}`);
  }
});

