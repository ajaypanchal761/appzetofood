import RestaurantOnboarding from '../models/RestaurantOnboarding.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

// Get current restaurant's onboarding data
export const getOnboarding = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const onboarding = await RestaurantOnboarding.findOne({ owner: ownerId }).lean();

    return successResponse(res, 200, 'Onboarding data retrieved', {
      onboarding: onboarding || null,
    });
  } catch (error) {
    console.error('Error fetching restaurant onboarding:', error);
    return errorResponse(res, 500, 'Failed to fetch onboarding data');
  }
};

// Upsert onboarding data (all steps in one payload)
export const upsertOnboarding = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { step1, step2, step3, completedSteps } = req.body;

    const update = {};
    if (step1) update.step1 = step1;
    if (step2) update.step2 = step2;
    if (step3) update.step3 = step3;
    if (typeof completedSteps === 'number') update.completedSteps = completedSteps;

    const onboarding = await RestaurantOnboarding.findOneAndUpdate(
      { owner: ownerId },
      {
        owner: ownerId,
        ...update,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return successResponse(res, 200, 'Onboarding data saved', {
      onboarding,
    });
  } catch (error) {
    console.error('Error saving restaurant onboarding:', error);
    return errorResponse(res, 500, 'Failed to save onboarding data');
  }
};


