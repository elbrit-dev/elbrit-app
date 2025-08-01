import { useCallback } from 'react';

// Exact pivot configuration functions extracted from PrimeDataTable.js
export const createPivotConfigHandlers = ({
  enablePivotUI,
  localPivotConfig,
  mergedPivotConfig,
  setIsPivotEnabled,
  setShowPivotConfig,
  enablePivotPersistence,
  finalSaveToCMS,
  isAdminUser,
  setIsSavingPivotConfig,
  pivotConfigKey,
  setLocalPivotConfig
}) => {

  // Apply pivot configuration (UI only - temporary) - EXACT CODE FROM PRIMEDATATABLE.JS
  const applyPivotConfig = useCallback(() => {
    if (enablePivotUI) {
      // Update the merged pivot config with local config
      const newConfig = { ...mergedPivotConfig, ...localPivotConfig };
      // console.log('Applying pivot config (UI only):', newConfig);
      setIsPivotEnabled(newConfig.enabled && newConfig.rows.length > 0);
    }
    setShowPivotConfig(false);
  }, [localPivotConfig, mergedPivotConfig, enablePivotUI]);

  // Apply AND Save pivot configuration to CMS - EXACT CODE FROM PRIMEDATATABLE.JS
  const applyAndSavePivotConfig = useCallback(async () => {
    if (enablePivotUI) {
      // First apply to UI
      const newConfig = { ...mergedPivotConfig, ...localPivotConfig };
      // console.log('Applying and saving pivot config:', newConfig);
      setIsPivotEnabled(newConfig.enabled && newConfig.rows.length > 0);
      
      // Then save to CMS (only if user is admin)
      if (enablePivotPersistence && finalSaveToCMS && isAdminUser()) {
        try {
          setIsSavingPivotConfig(true);
          await finalSaveToCMS(pivotConfigKey, localPivotConfig);
        } catch (error) {
          console.error('❌ CMS SAVE FAILED:', error);
          // Optionally show error notification to user
        } finally {
          setIsSavingPivotConfig(false);
        }
      } else if (enablePivotPersistence && !isAdminUser()) {
        // Pivot config applied locally but not saved to CMS (requires admin permissions)
      }
    }
    setShowPivotConfig(false);
  }, [localPivotConfig, mergedPivotConfig, enablePivotUI, enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  // Reset pivot configuration - EXACT CODE FROM PRIMEDATATABLE.JS
  const resetPivotConfig = useCallback(async () => {
    const defaultConfig = {
      enabled: false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      showGrandTotals: true,
      showRowTotals: true,
      showColumnTotals: true,
      showSubTotals: true
    };
    
    setLocalPivotConfig(defaultConfig);
    setIsPivotEnabled(false);
    
    // Save reset config to CMS (only if user is admin)
    if (enablePivotPersistence && finalSaveToCMS && isAdminUser()) {
      try {
        setIsSavingPivotConfig(true);
        await finalSaveToCMS(pivotConfigKey, defaultConfig);
        // console.log('🔄 RESET CONFIG SAVED TO CMS');
      } catch (error) {
        console.error('❌ FAILED TO SAVE RESET CONFIG:', error);
      } finally {
        setIsSavingPivotConfig(false);
      }
    } else if (enablePivotPersistence && !isAdminUser()) {
      // Pivot config reset locally but not saved to CMS (requires admin permissions)
    }
  }, [enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  // Manual save function for CMS persistence (admin only) - EXACT CODE FROM PRIMEDATATABLE.JS
  const savePivotConfigManually = useCallback(async () => {
    if (!enablePivotPersistence || !finalSaveToCMS) return;
    
    if (!isAdminUser()) {
      console.warn('🚫 Manual save denied: Only admin users can save pivot configurations');
      throw new Error('Access denied: Only admin users can save pivot configurations');
    }
    
    setIsSavingPivotConfig(true);
    try {
      // console.log('💾 MANUAL SAVE TO CMS - Config Key:', pivotConfigKey);
      // console.log('📊 MANUAL SAVE TO CMS - Pivot Config:', localPivotConfig);
      
      await finalSaveToCMS(pivotConfigKey, localPivotConfig);
      
      // console.log('✅ MANUAL CMS SAVE SUCCESSFUL!');
    } catch (error) {
      console.error('❌ MANUAL CMS SAVE FAILED:', error);
      throw error;
    } finally {
      setIsSavingPivotConfig(false);
    }
  }, [localPivotConfig, enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  return {
    applyPivotConfig,
    applyAndSavePivotConfig,
    resetPivotConfig,
    savePivotConfigManually
  };
};