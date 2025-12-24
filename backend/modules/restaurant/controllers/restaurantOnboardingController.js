import RestaurantOnboarding from '../models/RestaurantOnboarding.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { createRestaurantFromOnboarding } from './restaurantController.js';

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
    const { step1, step2, step3, step4, completedSteps } = req.body;

    const update = {};
    if (step1) update.step1 = step1;
    if (step2) update.step2 = step2;
    if (step3) update.step3 = step3;
    if (step4) update.step4 = step4;
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

    // If onboarding is complete (step 4), create restaurant
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
      ownerId: ownerId.toString(),
      willCreateRestaurant: finalCompletedSteps === 4,
    });
    
    // Create restaurant if onboarding is complete (step 4)
    // Also check if step4 is being sent (which means user is completing step 4)
    if (finalCompletedSteps === 4 || (step4 && completedSteps === 4)) {
      console.log('✅ Onboarding is complete (step 4), attempting to create restaurant...');
      
      // Fetch the complete onboarding document to ensure we have all steps
      const completeOnboarding = await RestaurantOnboarding.findOne({ owner: ownerId }).lean();
      
      console.log('📋 Complete onboarding data check:', {
        hasStep1: !!completeOnboarding?.step1,
        hasStep2: !!completeOnboarding?.step2,
        hasStep3: !!completeOnboarding?.step3,
        completedSteps: finalCompletedSteps,
        ownerId: ownerId.toString(),
        step1RestaurantName: completeOnboarding?.step1?.restaurantName,
        step1Keys: completeOnboarding?.step1 ? Object.keys(completeOnboarding.step1) : [],
        step2Keys: completeOnboarding?.step2 ? Object.keys(completeOnboarding.step2) : [],
      });
      
      if (completeOnboarding && completeOnboarding.step1 && completeOnboarding.step2) {
        // Step4 is optional - use defaults if not provided
        if (!completeOnboarding.step4) {
          console.warn('⚠️ Step4 data not found, using defaults for restaurant display data');
        }
        try {
          console.log('🚀 Attempting to create restaurant from onboarding...');
          console.log('📦 Step1 data:', JSON.stringify(completeOnboarding.step1, null, 2));
          console.log('📦 Step2 data:', JSON.stringify(completeOnboarding.step2, null, 2));
          
          const restaurant = await createRestaurantFromOnboarding(completeOnboarding, ownerId);
          
          if (restaurant) {
            console.log('✅ Restaurant created/updated successfully:', {
              restaurantId: restaurant.restaurantId,
              _id: restaurant._id,
              name: restaurant.name,
              slug: restaurant.slug,
              isActive: restaurant.isActive,
              isAcceptingOrders: restaurant.isAcceptingOrders,
            });
            
            // Verify restaurant was actually saved to database
            const Restaurant = (await import('../models/Restaurant.js')).default;
            const verifyRestaurant = await Restaurant.findOne({ _id: restaurant._id }).lean();
            
            if (verifyRestaurant) {
              console.log('✅ Restaurant verified in database:', {
                restaurantId: verifyRestaurant.restaurantId,
                isActive: verifyRestaurant.isActive,
              });
            } else {
              console.error('❌ Restaurant was not found in database after creation!');
            }
            
            // Return success response with restaurant info
            return successResponse(res, 200, 'Onboarding data saved and restaurant created', {
              onboarding,
              restaurant: {
                restaurantId: restaurant.restaurantId,
                _id: restaurant._id,
                name: restaurant.name,
                slug: restaurant.slug,
                isActive: restaurant.isActive,
              },
            });
          } else {
            console.warn('⚠️ Restaurant creation returned null/undefined');
            return successResponse(res, 200, 'Onboarding data saved, but restaurant creation failed', {
              onboarding,
              warning: 'Restaurant creation returned null',
            });
          }
        } catch (error) {
          console.error('❌ Error creating restaurant from onboarding:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
          
          // Return success for onboarding but include error info
          return successResponse(res, 200, 'Onboarding data saved, but restaurant creation failed', {
            onboarding,
            error: {
              message: error.message,
              name: error.name,
              code: error.code,
            },
            warning: 'Restaurant was not created. Please use POST /restaurant/onboarding/create-restaurant to create it manually.',
          });
        }
      } else {
        console.warn('⚠️ Cannot create restaurant: Incomplete onboarding data', {
          hasStep1: !!completeOnboarding?.step1,
          hasStep2: !!completeOnboarding?.step2,
          hasStep3: !!completeOnboarding?.step3,
          completedSteps: finalCompletedSteps,
          step1Data: completeOnboarding?.step1 ? Object.keys(completeOnboarding.step1) : null,
          step2Data: completeOnboarding?.step2 ? Object.keys(completeOnboarding.step2) : null,
        });
        
        return successResponse(res, 200, 'Onboarding data saved, but restaurant creation skipped due to incomplete data', {
          onboarding,
          warning: 'Restaurant creation skipped: Incomplete onboarding data',
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

// Manual trigger to create restaurant from onboarding (for debugging/fixing)
export const createRestaurantFromOnboardingManual = async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    // Fetch the complete onboarding document
    const completeOnboarding = await RestaurantOnboarding.findOne({ owner: ownerId }).lean();
    
    if (!completeOnboarding) {
      return errorResponse(res, 404, 'Onboarding data not found');
    }
    
    if (!completeOnboarding.step1 || !completeOnboarding.step2) {
      return errorResponse(res, 400, 'Incomplete onboarding data. Please complete all steps first.');
    }
    
    if (completeOnboarding.completedSteps !== 3) {
      return errorResponse(res, 400, `Onboarding not complete. Current step: ${completeOnboarding.completedSteps}/3`);
    }
    
    try {
      const restaurant = await createRestaurantFromOnboarding(completeOnboarding, ownerId);
      
      return successResponse(res, 200, 'Restaurant created successfully', {
        restaurant: {
          restaurantId: restaurant.restaurantId,
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          isActive: restaurant.isActive,
        },
      });
    } catch (error) {
      console.error('Error creating restaurant:', error);
      return errorResponse(res, 500, `Failed to create restaurant: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in createRestaurantFromOnboardingManual:', error);
    return errorResponse(res, 500, 'Failed to process request');
  }
};


