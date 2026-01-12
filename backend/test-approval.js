import mongoose from 'mongoose';
import Menu from './modules/restaurant/models/Menu.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Try multiple possible env variable names
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/appzetofood';
    
    if (!mongoURI || mongoURI === 'mongodb://localhost:27017/appzetofood') {
      console.log('⚠️  Using default MongoDB URI. Make sure MongoDB is running locally.');
      console.log('   Or set MONGODB_URI in .env file');
    } else {
      console.log('📡 Connecting to MongoDB...');
      // Mask password in log
      const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
      console.log('   URI:', maskedURI);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MongoDB is running');
    console.error('   2. Check MONGODB_URI in .env file');
    console.error('   3. Verify MongoDB connection string is correct');
    process.exit(1);
  }
};

// Test approval functionality
const testApproval = async () => {
  try {
    console.log('\n==========================================');
    console.log('🧪 TESTING FOOD APPROVAL FUNCTIONALITY');
    console.log('==========================================\n');

    // Step 1: Find a pending food item
    console.log('📋 Step 1: Finding a pending food item...');
    const menus = await Menu.find({ isActive: true }).lean();
    
    let foundItem = null;
    let foundMenu = null;
    let foundSection = null;
    let foundSubsection = null;
    
    for (const menu of menus) {
      for (const section of menu.sections || []) {
        // Check items in section
        const item = section.items.find(item => item.approvalStatus === 'pending');
        if (item) {
          foundItem = item;
          foundMenu = menu;
          foundSection = section;
          break;
        }

        // Check items in subsections
        for (const subsection of section.subsections || []) {
          const item = subsection.items.find(item => item.approvalStatus === 'pending');
          if (item) {
            foundItem = item;
            foundMenu = menu;
            foundSection = section;
            foundSubsection = subsection;
            break;
          }
        }
        if (foundItem) break;
      }
      if (foundItem) break;
    }

    if (!foundItem) {
      console.log('❌ No pending food item found. Creating a test item...');
      
      // Find any menu to add a test item
      const testMenu = await Menu.findOne({ isActive: true });
      if (!testMenu) {
        console.log('❌ No active menu found. Cannot create test item.');
        process.exit(1);
      }

      // Add a test pending item
      const testItem = {
        id: `item-test-${Date.now()}`,
        name: 'Test Food Item',
        category: 'Test',
        price: 100,
        approvalStatus: 'pending',
        requestedAt: new Date(),
        isAvailable: true,
        images: [],
        variations: [],
        tags: [],
        nutrition: [],
        allergies: []
      };

      if (testMenu.sections.length === 0) {
        testMenu.sections.push({
          id: `section-test-${Date.now()}`,
          name: 'Test Section',
          items: [testItem],
          subsections: [],
          isEnabled: true,
          order: 0
        });
      } else {
        testMenu.sections[0].items.push(testItem);
      }

      testMenu.markModified('sections');
      await testMenu.save();

      foundItem = testItem;
      foundMenu = testMenu;
      foundSection = testMenu.sections[0];
      
      console.log('✅ Test item created:', {
        id: foundItem.id,
        name: foundItem.name,
        status: foundItem.approvalStatus
      });
    } else {
      console.log('✅ Found pending item:', {
        id: foundItem.id,
        name: foundItem.name,
        status: foundItem.approvalStatus,
        menuId: foundMenu._id,
        section: foundSection.name
      });
    }

    const itemId = foundItem.id;
    const menuId = foundMenu._id;
    const adminId = new mongoose.Types.ObjectId(); // Mock admin ID

    // Step 2: Verify current status in database
    console.log('\n📋 Step 2: Verifying current status in database...');
    const menuBefore = await Menu.findById(menuId).lean();
    const itemBefore = menuBefore.sections
      .flatMap(s => [
        ...(s.items || []),
        ...(s.subsections || []).flatMap(sub => sub.items || [])
      ])
      .find(i => String(i.id) === String(itemId));

    console.log('Current status:', {
      approvalStatus: itemBefore.approvalStatus,
      approvedAt: itemBefore.approvedAt,
      approvedBy: itemBefore.approvedBy
    });

    if (itemBefore.approvalStatus !== 'pending') {
      console.log('⚠️ Item is not pending. Status:', itemBefore.approvalStatus);
      console.log('Setting to pending for test...');
      
      // Set to pending first
      const menuToReset = await Menu.findById(menuId);
      for (let sectionIndex = 0; sectionIndex < menuToReset.sections.length; sectionIndex++) {
        const section = menuToReset.sections[sectionIndex];
        if (String(section.id) === String(foundSection.id)) {
          if (foundSubsection) {
            const subsectionIndex = section.subsections.findIndex(s => String(s.id) === String(foundSubsection.id));
            if (subsectionIndex !== -1) {
              const itemIndex = section.subsections[subsectionIndex].items.findIndex(i => String(i.id) === String(itemId));
              if (itemIndex !== -1) {
                section.subsections[subsectionIndex].items[itemIndex].approvalStatus = 'pending';
                section.subsections[subsectionIndex].items[itemIndex].approvedAt = null;
                section.subsections[subsectionIndex].items[itemIndex].approvedBy = null;
                menuToReset.markModified(`sections.${sectionIndex}.subsections.${subsectionIndex}.items.${itemIndex}`);
                menuToReset.markModified(`sections.${sectionIndex}.subsections.${subsectionIndex}.items`);
                menuToReset.markModified(`sections.${sectionIndex}.subsections`);
                menuToReset.markModified(`sections.${sectionIndex}`);
                menuToReset.markModified('sections');
              }
            }
          } else {
            const itemIndex = section.items.findIndex(i => String(i.id) === String(itemId));
            if (itemIndex !== -1) {
              section.items[itemIndex].approvalStatus = 'pending';
              section.items[itemIndex].approvedAt = null;
              section.items[itemIndex].approvedBy = null;
              menuToReset.markModified(`sections.${sectionIndex}.items.${itemIndex}`);
              menuToReset.markModified(`sections.${sectionIndex}.items`);
              menuToReset.markModified(`sections.${sectionIndex}`);
              menuToReset.markModified('sections');
            }
          }
          break;
        }
      }
      await menuToReset.save();
      console.log('✅ Item reset to pending');
    }

    // Step 3: Simulate approval (same logic as controller)
    console.log('\n📋 Step 3: Simulating approval process...');
    const menu = await Menu.findById(menuId);
    
    let itemUpdated = false;
    
    for (let sectionIndex = 0; sectionIndex < menu.sections.length; sectionIndex++) {
      const section = menu.sections[sectionIndex];
      
      if (String(section.id) !== String(foundSection.id)) {
        continue;
      }
      
      if (foundSubsection) {
        const subsectionIndex = section.subsections.findIndex(s => String(s.id) === String(foundSubsection.id));
        if (subsectionIndex !== -1) {
          const itemIndex = section.subsections[subsectionIndex].items.findIndex(i => String(i.id) === String(itemId));
          if (itemIndex !== -1) {
            const item = section.subsections[subsectionIndex].items[itemIndex];
            console.log('Found item in subsection, updating...');
            item.approvalStatus = 'approved';
            item.approvedAt = new Date();
            item.approvedBy = adminId;
            item.rejectionReason = '';
            
            menu.markModified(`sections.${sectionIndex}.subsections.${subsectionIndex}.items.${itemIndex}`);
            menu.markModified(`sections.${sectionIndex}.subsections.${subsectionIndex}.items`);
            menu.markModified(`sections.${sectionIndex}.subsections.${subsectionIndex}`);
            menu.markModified(`sections.${sectionIndex}.subsections`);
            menu.markModified(`sections.${sectionIndex}`);
            menu.markModified('sections');
            
            itemUpdated = true;
            break;
          }
        }
      } else {
        const itemIndex = section.items.findIndex(i => String(i.id) === String(itemId));
        if (itemIndex !== -1) {
          const item = section.items[itemIndex];
          console.log('Found item in section, updating...');
          item.approvalStatus = 'approved';
          item.approvedAt = new Date();
          item.approvedBy = adminId;
          item.rejectionReason = '';
          
          menu.markModified(`sections.${sectionIndex}.items.${itemIndex}`);
          menu.markModified(`sections.${sectionIndex}.items`);
          menu.markModified(`sections.${sectionIndex}`);
          menu.markModified('sections');
          
          itemUpdated = true;
          break;
        }
      }
    }

    if (!itemUpdated) {
      console.log('❌ Failed to find item for update');
      process.exit(1);
    }

    console.log('Saving menu to database...');
    await menu.save();
    console.log('✅ Menu saved');

    // Step 4: Verify the update in database
    console.log('\n📋 Step 4: Verifying update in database...');
    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
    
    const menuAfter = await Menu.findById(menuId).lean();
    const itemAfter = menuAfter.sections
      .flatMap(s => [
        ...(s.items || []),
        ...(s.subsections || []).flatMap(sub => sub.items || [])
      ])
      .find(i => String(i.id) === String(itemId));

    console.log('After approval status:', {
      approvalStatus: itemAfter.approvalStatus,
      approvedAt: itemAfter.approvedAt,
      approvedBy: itemAfter.approvedBy
    });

    // Step 5: Final verification
    console.log('\n📋 Step 5: Final verification...');
    if (itemAfter.approvalStatus === 'approved') {
      console.log('✅ SUCCESS: Item is approved in database!');
      console.log('✅ approvedAt:', itemAfter.approvedAt);
      console.log('✅ approvedBy:', itemAfter.approvedBy);
      console.log('\n✅ TEST PASSED: Approval is properly stored in database!');
    } else {
      console.log('❌ FAILED: Item status is', itemAfter.approvalStatus, 'expected "approved"');
      console.log('❌ TEST FAILED: Approval is NOT properly stored in database!');
      process.exit(1);
    }

    console.log('\n==========================================');
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('==========================================\n');

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testApproval();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

runTest();

