import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { createRestaurantFromOnboarding } from './restaurantController.js';

// Get current restaurant's onboarding data
export const getOnboarding = async (req, res) => {
  try {
    // Check if restaurant is authenticated
    if (!req.restaurant || !req.restaurant._id) {
      return errorResponse(res, 401, 'Restaurant not authenticated');
    }

    const restaurantId = req.restaurant._id;
    const restaurant = await Restaurant.findById(restaurantId).select('onboarding').lean();

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    return successResponse(res, 200, 'Onboarding data retrieved', {
      onboarding: restaurant.onboarding || null,
    });
  } catch (error) {
    console.error('Error fetching restaurant onboarding:', error);
    return errorResponse(res, 500, 'Failed to fetch onboarding data');
  }
};

// Upsert onboarding data (all steps in one payload)
export const upsertOnboarding = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const { step1, step2, step3, step4, completedSteps } = req.body;

    const update = {};
    if (step1) update['onboarding.step1'] = step1;
    if (step2) update['onboarding.step2'] = step2;
    if (step3) update['onboarding.step3'] = step3;
    if (step4) update['onboarding.step4'] = step4;
    if (typeof completedSteps === 'number') update['onboarding.completedSteps'] = completedSteps;

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: update },
      {
        new: true,
        upsert: false,
      }
    );

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    const onboarding = restaurant.onboarding;

    // If onboarding is complete (step 4), update restaurant with final data
    // Check both the request body and the saved document's completedSteps
    const finalCompletedSteps = onboarding.completedSteps || completedSteps;
    
    console.log('🔍 Onboarding update check:', {
      requestCompletedSteps: completedSteps,
      savedCompletedSteps: onboarding.completedSteps,
      finalCompletedSteps,
      hasStep1: !!step1,
      hasStep2: !!step2,
      hasStep3: !!step3,
      hasStep4: !!step4,
      restaurantId: restaurantId.toString(),
      willUpdateRestaurant: finalCompletedSteps === 4,
    });
    
    // Update restaurant with final data if onboarding is complete (step 4)
    // Also check if step4 is being sent (which means user is completing step 4)
    if (finalCompletedSteps === 4 || (step4 && completedSteps === 4)) {
      console.log('✅ Onboarding is complete (step 4), updating restaurant with final data...');
      
      // Fetch the complete restaurant with onboarding data
      const completeRestaurant = await Restaurant.findById(restaurantId).lean();
      
      console.log('📋 Complete onboarding data check:', {
        hasStep1: !!completeRestaurant?.onboarding?.step1,
        hasStep2: !!completeRestaurant?.onboarding?.step2,
        hasStep3: !!completeRestaurant?.onboarding?.step3,
        completedSteps: finalCompletedSteps,
        restaurantId: restaurantId.toString(),
        step1RestaurantName: completeRestaurant?.onboarding?.step1?.restaurantName,
        step1Keys: completeRestaurant?.onboarding?.step1 ? Object.keys(completeRestaurant.onboarding.step1) : [],
        step2Keys: completeRestaurant?.onboarding?.step2 ? Object.keys(completeRestaurant.onboarding.step2) : [],
      });
      
      if (completeRestaurant && completeRestaurant.onboarding?.step1 && completeRestaurant.onboarding?.step2) {
        // Step4 is optional - use defaults if not provided
        if (!completeRestaurant.onboarding.step4) {
          console.warn('⚠️ Step4 data not found, using defaults for restaurant display data');
        }
        try {
          console.log('🚀 Attempting to update restaurant from onboarding...');
          console.log('📦 Step1 data:', JSON.stringify(completeRestaurant.onboarding.step1, null, 2));
          console.log('📦 Step2 data:', JSON.stringify(completeRestaurant.onboarding.step2, null, 2));
          
          const updatedRestaurant = await createRestaurantFromOnboarding(completeRestaurant.onboarding, restaurantId);
          
          if (updatedRestaurant) {
            console.log('✅ Restaurant updated successfully:', {
              restaurantId: updatedRestaurant.restaurantId,
              _id: updatedRestaurant._id,
              name: updatedRestaurant.name,
              slug: updatedRestaurant.slug,
              isActive: updatedRestaurant.isActive,
              isAcceptingOrders: updatedRestaurant.isAcceptingOrders,
            });
            
            // Return success response with restaurant info
            return successResponse(res, 200, 'Onboarding data saved and restaurant updated', {
              onboarding,
              restaurant: {
                restaurantId: updatedRestaurant.restaurantId,
                _id: updatedRestaurant._id,
                name: updatedRestaurant.name,
                slug: updatedRestaurant.slug,
                isActive: updatedRestaurant.isActive,
              },
            });
          } else {
            console.warn('⚠️ Restaurant update returned null/undefined');
            return successResponse(res, 200, 'Onboarding data saved, but restaurant update failed', {
              onboarding,
              warning: 'Restaurant update returned null',
            });
          }
        } catch (error) {
          console.error('❌ Error updating restaurant from onboarding:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          
          // Return success for onboarding but include error info
          return successResponse(res, 200, 'Onboarding data saved, but restaurant update failed', {
            onboarding,
            error: {
              message: error.message,
              name: error.name,
              code: error.code,
            },
            warning: 'Restaurant was not updated. Please use POST /restaurant/onboarding/create-restaurant to update it manually.',
          });
        }
      } else {
        console.warn('⚠️ Cannot update restaurant: Incomplete onboarding data', {
          hasStep1: !!completeRestaurant?.onboarding?.step1,
          hasStep2: !!completeRestaurant?.onboarding?.step2,
          hasStep3: !!completeRestaurant?.onboarding?.step3,
          completedSteps: finalCompletedSteps,
          step1Data: completeRestaurant?.onboarding?.step1 ? Object.keys(completeRestaurant.onboarding.step1) : null,
          step2Data: completeRestaurant?.onboarding?.step2 ? Object.keys(completeRestaurant.onboarding.step2) : null,
        });
        
        return successResponse(res, 200, 'Onboarding data saved, but restaurant update skipped due to incomplete data', {
          onboarding,
          warning: 'Restaurant update skipped: Incomplete onboarding data',
        });
      }
    }

    return successResponse(res, 200, 'Onboarding data saved', {
      onboarding,
    });
  } catch (error) {
    console.error('Error saving restaurant onboarding:', error);
    return errorResponse(res, 500, 'Failed to save onboarding data');
  }
};

// Manual trigger to update restaurant from onboarding (for debugging/fixing)
export const createRestaurantFromOnboardingManual = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    
    // Fetch the complete restaurant with onboarding data
    const restaurant = await Restaurant.findById(restaurantId).lean();
    
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }
    
    if (!restaurant.onboarding) {
      return errorResponse(res, 404, 'Onboarding data not found');
    }
    
    if (!restaurant.onboarding.step1 || !restaurant.onboarding.step2) {
      return errorResponse(res, 400, 'Incomplete onboarding data. Please complete all steps first.');
    }
    
    if (restaurant.onboarding.completedSteps !== 3) {
      return errorResponse(res, 400, `Onboarding not complete. Current step: ${restaurant.onboarding.completedSteps}/3`);
    }
    
    try {
      const updatedRestaurant = await createRestaurantFromOnboarding(restaurant.onboarding, restaurantId);
      
      return successResponse(res, 200, 'Restaurant updated successfully', {
        restaurant: {
          restaurantId: updatedRestaurant.restaurantId,
          _id: updatedRestaurant._id,
          name: updatedRestaurant.name,
          slug: updatedRestaurant.slug,
          isActive: updatedRestaurant.isActive,
        },
      });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      return errorResponse(res, 500, `Failed to update restaurant: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in createRestaurantFromOnboardingManual:', error);
    return errorResponse(res, 500, 'Failed to process request');
  }
};


