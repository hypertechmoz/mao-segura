PS C:\Users\Scott> cd D:\Download\platform-tools-latest-windows\platform-tools
PS D:\Download\platform-tools-latest-windows\platform-tools> .\adb logcat --pid=6845
PS D:\Download\platform-tools-latest-windows\platform-tools> .\adb shell pidof com.maosegura.app
15318
PS D:\Download\platform-tools-latest-windows\platform-tools> .\adb logcat --pid=15318
--------- beginning of system
07-17 19:23:48.870 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.graphics.TranGraphicImpl@6cf591f from com.transsion.hubcore.graphics.ITranGraphic
07-17 19:23:49.839 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.view.TranViewImpl@7b19e25 from com.transsion.hubcore.view.ITranView
07-17 19:23:49.850 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.magellan.implement.TranMagellanViewComponentImpl@fcd2408 from com.transsion.hubcore.magellan.ITranMagellanViewComponent
07-17 19:23:49.883 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.internal.TranInternalViewImpl@1478b4 from com.transsion.hubcore.internal.ITranInternalView
07-17 19:23:49.942 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.app.TranActivityImpl@f668726 from com.transsion.hubcore.app.ITranActivity
07-17 19:23:49.943 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.magellan.implement.TranMagellanActivityComponentImpl@4426114 from com.transsion.hubcore.magellan.ITranMagellanActivityComponent
07-17 19:23:55.780 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.widget.TranOverScrollerImpl@c3749b7 from com.transsion.hubcore.widget.ITranOverScroller
07-17 19:23:55.787 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.flingmanager.implement.TranFlingManagerImpl@68a5524 from com.transsion.hubcore.flingmanager.ITranFlingManager
07-17 19:23:55.789 15318 15318 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.magellan.implement.TranMagellanComponentImpl@caf688d from com.transsion.hubcore.magellan.ITranMagellanComponent
--------- beginning of main
07-17 19:26:46.011 15318 15318 W [RNScreens]: backTitleVisible prop is not available on Android
07-17 19:26:46.011 15318 15318 W [RNScreens]: disableBackButtonMenu prop is not available on Android
07-17 19:26:46.011 15318 15318 W [RNScreens]: largeTitleFontFamily prop is not available on Android
07-17 19:26:46.011 15318 15318 W [RNScreens]: backTitleFontFamily prop is not available on Android
07-17 19:26:46.012 15318 15318 W [RNScreens]: largeTitleFontWeight prop is not available on Android
07-17 19:26:46.012 15318 15318 W [RNScreens]: largeTitleHideShadow prop is not available on Android
07-17 19:26:49.583 15318 15322 I m.maosegura.app: Background young concurrent mark compact GC freed 6475KB AllocSpace bytes, 0(0B) LOS objects, 45% free, 8010KB/14MB, paused 1.126ms,6.366ms total 269.213ms
07-17 19:26:55.469 15318 15318 W [RNScreens]: backTitleVisible prop is not available on Android
07-17 19:26:55.469 15318 15318 W [RNScreens]: disableBackButtonMenu prop is not available on Android
07-17 19:26:55.469 15318 15318 W [RNScreens]: largeTitleFontFamily prop is not available on Android
07-17 19:26:55.469 15318 15318 W [RNScreens]: backTitleFontFamily prop is not available on Android
07-17 19:26:55.469 15318 15318 W [RNScreens]: largeTitleFontWeight prop is not available on Android
07-17 19:26:55.469 15318 15318 W [RNScreens]: largeTitleHideShadow prop is not available on Android
07-17 19:26:58.159 15318 15318 W [RNScreens]: backTitleVisible prop is not available on Android
07-17 19:26:58.160 15318 15318 W [RNScreens]: disableBackButtonMenu prop is not available on Android
07-17 19:26:58.160 15318 15318 W [RNScreens]: largeTitleFontFamily prop is not available on Android
07-17 19:26:58.160 15318 15318 W [RNScreens]: backTitleFontFamily prop is not available on Android
07-17 19:26:58.160 15318 15318 W [RNScreens]: largeTitleFontWeight prop is not available on Android
07-17 19:26:58.160 15318 15318 W [RNScreens]: largeTitleHideShadow prop is not available on Android
07-17 19:27:00.198 15318 15322 I m.maosegura.app: Background concurrent mark compact GC freed 6960KB AllocSpace bytes, 0(0B) LOS objects, 49% free, 8007KB/15MB, paused 1.582ms,5.100ms total 171.604ms
07-17 19:27:02.846 15318 15365 E ReactNativeJS: { [Error: cannot add `postgres_changes` callbacks for realtime:messages-list after `subscribe()`.]
07-17 19:27:02.846 15318 15365 E ReactNativeJS:   componentStack: '\n    at Messages (address at index.android.bundle:1:1469031)\n    at Suspense (<anonymous>)\n    at Route (address at index.android.bundle:1:924661)\n    at BaseRoute (address at index.android.bundle:1:931551)\n    at StaticContainer (address at index.android.bundle:1:895904)\n    at EnsureSingleNavigator (address at index.android.bundle:1:840208)\n    at SceneView (address at index.android.bundle:1:893636)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at Animated(View) (address at index.android.bundle:1:625401)\n    at Background (address at index.android.bundle:1:943360)\n    at Screen (address at index.android.bundle:1:989699)\n    at RNSScreen (<anonymous>)\n    at Animated(Anonymous) (address at index.android.bundle:1:625401)\n    at Suspender (address at index.android.bundle:1:1006703)\n    at Suspense (<anonymous>)\n    at Freeze (address at index.android.bundle:1:1006764)\n    at DelayedFreeze (address at index.android.bundle:1:1006345)\n    at InnerScreen (address at index.android.bundle:1:1004061)\n    at anonymous (address at index.android.bundle:1:1005743)\n    at MaybeScreen (address at index.android.bundle:1:999612)\n    at RNSScreenContainer (<anonymous>)\n    at ScreenContainer (address at index.android.bundle:1:1013760)\n    at MaybeScreenContainer (address at index.android.bundle:1:999774)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at FrameSizeProvider (address at index.android.bundle:1:977463)\n    at SafeAreaProviderCompat (address at index.android.bundle:1:988905)\n    at BottomTabView (address at index.android.bundle:1:937809)\n    at PreventRemoveProvider (address at index.android.bundle:1:878590)\n    at NavigationStateListenerProvider (address at index.android.bundle:1:901233)\n    at NavigationContent (address at index.android.bundle:1:890792)\n    at anonymous (address at index.android.bundle:1:890695)\n    at BottomTabNavigator (address at index.android.bundle:1:936888)\n    at anonymous (address at index.android.bundle:1:923582)\n    at TabLayout (address at index.android.bundle:1:806019)\n    at Suspense (<anonymous>)\n    at Route (address at index.android.bundle:1:924661)\n    at BaseRoute (address at index.android.bundle:1:931551)\n    at StaticContainer (address at index.android.bundle:1:895904)\n    at EnsureSingleNavigator (address at index.android.bundle:1:840208)\n    at SceneView (address at index.android.bundle:1:893636)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at RNSScreenContentWrapper (<anonymous>)\n    at ScreenContentWrapper (<anonymous>)\n    at DebugContainer (<anonymous>)\n    at RNSScreen (<anonymous>)\n    at Animated(Anonymous) (address at index.android.bundle:1:625401)\n    at Suspender (address at index.android.bundle:1:1006703)\n    at Suspense (<anonymous>)\n    at Freeze (address at index.android.bundle:1:1006764)\n    at DelayedFreeze (address at index.android.bundle:1:1006345)\n    at InnerScreen (address at index.android.bundle:1:1004061)\n    at anonymous (address at index.android.bundle:1:1005743)\n    at ScreenStackItem (address at index.android.bundle:1:1016393)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at SceneView (address at index.android.bundle:1:1039779)\n    at RNSScreenStack (<anonymous>)\n    at anonymous (address at index.android.bundle:1:1015471)\n    at ScreenStack (address at index.android.bundle:1:1014659)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at FrameSizeProvider (address at index.android.bundle:1:977463)\n    at SafeAreaProviderCompat (address at index.android.bundle:1:988905)\n    at NativeStackView (address at index.android.bundle:1:1038339)\n    at PreventRemoveProvider (address at ind
07-17 19:27:02.846 15318 15365 E ReactNativeJS:   isComponentError: true }
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: ReactHost{0}.handleHostException(message = "Error: cannot add `postgres_changes` callbacks for realtime:messages-list after `subscribe()`.
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: This error is located at:
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Messages (address at index.android.bundle:1:1469031)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspense (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Route (address at index.android.bundle:1:924661)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at BaseRoute (address at index.android.bundle:1:931551)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at StaticContainer (address at index.android.bundle:1:895904)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SceneView (address at index.android.bundle:1:893636)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RCTView (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RCTView (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Animated(View) (address at index.android.bundle:1:625401)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Background (address at index.android.bundle:1:943360)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Screen (address at index.android.bundle:1:989699)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RNSScreen (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Animated(Anonymous) (address at index.android.bundle:1:625401)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspender (address at index.android.bundle:1:1006703)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspense (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Freeze (address at index.android.bundle:1:1006764)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at DelayedFreeze (address at index.android.bundle:1:1006345)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at InnerScreen (address at index.android.bundle:1:1004061)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:1005743)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at MaybeScreen (address at index.android.bundle:1:999612)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RNSScreenContainer (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ScreenContainer (address at index.android.bundle:1:1013760)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at MaybeScreenContainer (address at index.android.bundle:1:999774)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RCTView (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at FrameSizeProvider (address at index.android.bundle:1:977463)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SafeAreaProviderCompat (address at index.android.bundle:1:988905)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at BottomTabView (address at index.android.bundle:1:937809)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at PreventRemoveProvider (address at index.android.bundle:1:878590)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationStateListenerProvider (address at index.android.bundle:1:901233)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationContent (address at index.android.bundle:1:890792)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:890695)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at BottomTabNavigator (address at index.android.bundle:1:936888)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:923582)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at TabLayout (address at index.android.bundle:1:806019)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspense (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Route (address at index.android.bundle:1:924661)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at BaseRoute (address at index.android.bundle:1:931551)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at StaticContainer (address at index.android.bundle:1:895904)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SceneView (address at index.android.bundle:1:893636)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RNSScreenContentWrapper (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ScreenContentWrapper (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at DebugContainer (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RNSScreen (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Animated(Anonymous) (address at index.android.bundle:1:625401)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspender (address at index.android.bundle:1:1006703)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspense (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Freeze (address at index.android.bundle:1:1006764)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at DelayedFreeze (address at index.android.bundle:1:1006345)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at InnerScreen (address at index.android.bundle:1:1004061)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:1005743)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ScreenStackItem (address at index.android.bundle:1:1016393)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SceneView (address at index.android.bundle:1:1039779)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RNSScreenStack (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:1015471)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ScreenStack (address at index.android.bundle:1:1014659)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RCTView (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at FrameSizeProvider (address at index.android.bundle:1:977463)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SafeAreaProviderCompat (address at index.android.bundle:1:988905)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NativeStackView (address at index.android.bundle:1:1038339)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at PreventRemoveProvider (address at index.android.bundle:1:878590)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationStateListenerProvider (address at index.android.bundle:1:901233)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationContent (address at index.android.bundle:1:890792)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:890695)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NativeStackNavigator (address at index.android.bundle:1:1034626)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:923582)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:812655)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RootLayout (address at index.android.bundle:1:1608358)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Suspense (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Route (address at index.android.bundle:1:924661)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at BaseRoute (address at index.android.bundle:1:931551)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at StaticContainer (address at index.android.bundle:1:895904)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SceneView (address at index.android.bundle:1:893636)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at PreventRemoveProvider (address at index.android.bundle:1:878590)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationStateListenerProvider (address at index.android.bundle:1:901233)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationContent (address at index.android.bundle:1:890792)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:890695)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at Content (address at index.android.bundle:1:1137047)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RNCSafeAreaProvider (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at SafeAreaProvider (address at index.android.bundle:1:973988)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at LinkPreviewContextProvider (address at index.android.bundle:1:1048140)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at anonymous (address at index.android.bundle:1:1135955)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ThemeProvider (address at index.android.bundle:1:842368)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at BaseNavigationContainer (address at index.android.bundle:1:818958)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at NavigationContainerInner (address at index.android.bundle:1:1138906)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ContextNavigator (address at index.android.bundle:1:1136184)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at ExpoRoot (address at index.android.bundle:1:1135827)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at App (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at RCTView (<anonymous>)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact:     at AppContainer (address at index.android.bundle:1:471312), stack:
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: on@1:1213085
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: anonymous@1:1470641
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitHookEffectListMount@1:263202
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270229
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270047
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269061
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269296
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitPassiveMountOnFiber@1:269506
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: flushPassiveEffects@1:278993
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: flushPendingEffects@1:278776
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: flushSpawnedWork@1:278552
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitRoot@1:277590
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: commitRootWhenReady@1:273371
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: performWorkOnRoot@1:272996
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: performSyncWorkOnRoot@1:226481
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: flushSyncWorkAcrossRoots_impl@1:225372
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: processRootScheduleInMicrotask@1:225732
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: anonymous@1:226576
07-17 19:27:02.902 15318 15366 W unknown:BridgelessReact: ")
--------- beginning of crash
07-17 19:27:02.909 15318 15366 E AndroidRuntime: FATAL EXCEPTION: mqt_v_native
07-17 19:27:02.909 15318 15366 E AndroidRuntime: Process: com.maosegura.app, PID: 15318
07-17 19:27:02.909 15318 15366 E AndroidRuntime: com.facebook.react.common.JavascriptException: Error: cannot add `postgres_changes` callbacks for realtime:messages-list after `subscribe()`.
07-17 19:27:02.909 15318 15366 E AndroidRuntime:
07-17 19:27:02.909 15318 15366 E AndroidRuntime: This error is located at:
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Messages (address at index.android.bundle:1:1469031)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Suspense (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Route (address at index.android.bundle:1:924661)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at BaseRoute (address at index.android.bundle:1:931551)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at StaticContainer (address at index.android.bundle:1:895904)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at SceneView (address at index.android.bundle:1:893636)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RCTView (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RCTView (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Animated(View) (address at index.android.bundle:1:625401)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Background (address at index.android.bundle:1:943360)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Screen (address at index.android.bundle:1:989699)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RNSScreen (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Animated(Anonymous) (address at index.android.bundle:1:625401)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Suspender (address at index.android.bundle:1:1006703)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Suspense (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Freeze (address at index.android.bundle:1:1006764)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at DelayedFreeze (address at index.android.bundle:1:1006345)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at InnerScreen (address at index.android.bundle:1:1004061)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:1005743)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at MaybeScreen (address at index.android.bundle:1:999612)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RNSScreenContainer (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at ScreenContainer (address at index.android.bundle:1:1013760)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at MaybeScreenContainer (address at index.android.bundle:1:999774)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RCTView (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at FrameSizeProvider (address at index.android.bundle:1:977463)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at SafeAreaProviderCompat (address at index.android.bundle:1:988905)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at BottomTabView (address at index.android.bundle:1:937809)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at PreventRemoveProvider (address at index.android.bundle:1:878590)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at NavigationStateListenerProvider (address at index.android.bundle:1:901233)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at NavigationContent (address at index.android.bundle:1:890792)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:890695)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at BottomTabNavigator (address at index.android.bundle:1:936888)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:923582)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at TabLayout (address at index.android.bundle:1:806019)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Suspense (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Route (address at index.android.bundle:1:924661)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at BaseRoute (address at index.android.bundle:1:931551)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at StaticContainer (address at index.android.bundle:1:895904)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at SceneView (address at index.android.bundle:1:893636)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RNSScreenContentWrapper (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at ScreenContentWrapper (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at DebugContainer (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RNSScreen (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Animated(Anonymous) (address at index.android.bundle:1:625401)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Suspender (address at index.android.bundle:1:1006703)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Suspense (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at Freeze (address at index.android.bundle:1:1006764)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at DelayedFreeze (address at index.android.bundle:1:1006345)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at InnerScreen (address at index.android.bundle:1:1004061)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:1005743)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at ScreenStackItem (address at index.android.bundle:1:1016393)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at SceneView (address at index.android.bundle:1:1039779)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RNSScreenStack (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:1015471)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at ScreenStack (address at index.android.bundle:1:1014659)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at RCTView (<anonymous>)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.909 15318 15366 E AndroidRuntime:     at FrameSizeProvider (address at index.android.bundle:1:977463)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at SafeAreaProviderCompat (address at index.android.bundle:1:988905)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NativeStackView (address at index.android.bundle:1:1038339)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at PreventRemoveProvider (address at index.android.bundle:1:878590)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NavigationStateListenerProvider (address at index.android.bundle:1:901233)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NavigationContent (address at index.android.bundle:1:890792)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:890695)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NativeStackNavigator (address at index.android.bundle:1:1034626)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:923582)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:812655)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at RootLayout (address at index.android.bundle:1:1608358)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at Suspense (<anonymous>)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at Route (address at index.android.bundle:1:924661)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at BaseRoute (address at index.android.bundle:1:931551)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at StaticContainer (address at index.android.bundle:1:895904)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at SceneView (address at index.android.bundle:1:893636)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NavigationProvider (address at index.android.bundle:1:854215)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at PreventRemoveProvider (address at index.android.bundle:1:878590)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NavigationStateListenerProvider (address at index.android.bundle:1:901233)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NavigationContent (address at index.android.bundle:1:890792)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:890695)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at Content (address at index.android.bundle:1:1137047)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at RNCSafeAreaProvider (<anonymous>)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at SafeAreaProvider (address at index.android.bundle:1:973988)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at LinkPreviewContextProvider (address at index.android.bundle:1:1048140)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at anonymous (address at index.android.bundle:1:1135955)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at ThemeProvider (address at index.android.bundle:1:842368)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at EnsureSingleNavigator (address at index.android.bundle:1:840208)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at BaseNavigationContainer (address at index.android.bundle:1:818958)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at NavigationContainerInner (address at index.android.bundle:1:1138906)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at ContextNavigator (address at index.android.bundle:1:1136184)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at ExpoRoot (address at index.android.bundle:1:1135827)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at App (<anonymous>)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at RCTView (<anonymous>)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at View (address at index.android.bundle:1:471984)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:     at AppContainer (address at index.android.bundle:1:471312), stack:
07-17 19:27:02.910 15318 15366 E AndroidRuntime: on@1:1213085
07-17 19:27:02.910 15318 15366 E AndroidRuntime: anonymous@1:1470641
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitHookEffectListMount@1:263202
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270229
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270047
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:269914
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraverseReconnectPassiveEffects@1:270220
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269061
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269296
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269681
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269739
07-17 19:27:02.910 15318 15366 E AndroidRuntime: recursivelyTraversePassiveMountEffects@1:268816
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitPassiveMountOnFiber@1:269506
07-17 19:27:02.910 15318 15366 E AndroidRuntime: flushPassiveEffects@1:278993
07-17 19:27:02.910 15318 15366 E AndroidRuntime: flushPendingEffects@1:278776
07-17 19:27:02.910 15318 15366 E AndroidRuntime: flushSpawnedWork@1:278552
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitRoot@1:277590
07-17 19:27:02.910 15318 15366 E AndroidRuntime: commitRootWhenReady@1:273371
07-17 19:27:02.910 15318 15366 E AndroidRuntime: performWorkOnRoot@1:272996
07-17 19:27:02.910 15318 15366 E AndroidRuntime: performSyncWorkOnRoot@1:226481
07-17 19:27:02.910 15318 15366 E AndroidRuntime: flushSyncWorkAcrossRoots_impl@1:225372
07-17 19:27:02.910 15318 15366 E AndroidRuntime: processRootScheduleInMicrotask@1:225732
07-17 19:27:02.910 15318 15366 E AndroidRuntime: anonymous@1:226576
07-17 19:27:02.910 15318 15366 E AndroidRuntime:
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at com.facebook.react.modules.core.ExceptionsManagerModule.reportException(ExceptionsManagerModule.kt:52)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at com.facebook.jni.NativeRunnable.run(Native Method)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at android.os.Handler.handleCallback(Handler.java:958)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at android.os.Handler.dispatchMessage(Handler.java:99)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at com.facebook.react.bridge.queue.MessageQueueThreadHandler.dispatchMessage(MessageQueueThreadHandler.kt:21)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at android.os.Looper.loopOnce(Looper.java:205)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at android.os.Looper.loop(Looper.java:294)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at com.facebook.react.bridge.queue.MessageQueueThreadImpl$Companion.startNewBackgroundThread$lambda$1(MessageQueueThreadImpl.kt:175)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at com.facebook.react.bridge.queue.MessageQueueThreadImpl$Companion.$r8$lambda$ldnZnqelhYFctGaUKkOKYj5rxo4(MessageQueueThreadImpl.kt:0)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at com.facebook.react.bridge.queue.MessageQueueThreadImpl$Companion$$ExternalSyntheticLambda0.run(D8$$SyntheticClass:0)
07-17 19:27:02.910 15318 15366 E AndroidRuntime:        at java.lang.Thread.run(Thread.java:1572)
07-17 19:27:03.070 15318 15365 E ReactNativeJS: { [TypeError: undefined is not a function]
07-17 19:27:03.070 15318 15365 E ReactNativeJS:   componentStack: '\n    at RootLayout (address at index.android.bundle:1:1608358)\n    at Suspense (<anonymous>)\n    at Route (address at index.android.bundle:1:924661)\n    at BaseRoute (address at index.android.bundle:1:931551)\n    at StaticContainer (address at index.android.bundle:1:895904)\n    at EnsureSingleNavigator (address at index.android.bundle:1:840208)\n    at SceneView (address at index.android.bundle:1:893636)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at PreventRemoveProvider (address at index.android.bundle:1:878590)\n    at NavigationStateListenerProvider (address at index.android.bundle:1:901233)\n    at NavigationContent (address at index.android.bundle:1:890792)\n    at anonymous (address at index.android.bundle:1:890695)\n    at Content (address at index.android.bundle:1:1137047)\n    at RNCSafeAreaProvider (<anonymous>)\n    at SafeAreaProvider (address at index.android.bundle:1:973988)\n    at LinkPreviewContextProvider (address at index.android.bundle:1:1048140)\n    at anonymous (address at index.android.bundle:1:1135955)\n    at ThemeProvider (address at index.android.bundle:1:842368)\n    at EnsureSingleNavigator (address at index.android.bundle:1:840208)\n    at BaseNavigationContainer (address at index.android.bundle:1:818958)\n    at NavigationContainerInner (address at index.android.bundle:1:1138906)\n    at ContextNavigator (address at index.android.bundle:1:1136184)\n    at ExpoRoot (address at index.android.bundle:1:1135827)\n    at App (<anonymous>)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at AppContainer (address at index.android.bundle:1:471312)',
07-17 19:27:03.070 15318 15365 E ReactNativeJS:   isComponentError: true }
07-17 19:27:03.074 15318 15365 E ReactNativeJS: { [TypeError: undefined is not a function]
07-17 19:27:03.074 15318 15365 E ReactNativeJS:   componentStack: '\n    at Profile (address at index.android.bundle:1:1495637)\n    at Suspense (<anonymous>)\n    at Route (address at index.android.bundle:1:924661)\n    at BaseRoute (address at index.android.bundle:1:931551)\n    at StaticContainer (address at index.android.bundle:1:895904)\n    at EnsureSingleNavigator (address at index.android.bundle:1:840208)\n    at SceneView (address at index.android.bundle:1:893636)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at Animated(View) (address at index.android.bundle:1:625401)\n    at Background (address at index.android.bundle:1:943360)\n    at Screen (address at index.android.bundle:1:989699)\n    at RNSScreen (<anonymous>)\n    at Animated(Anonymous) (address at index.android.bundle:1:625401)\n    at Suspender (address at index.android.bundle:1:1006703)\n    at Suspense (<anonymous>)\n    at Freeze (address at index.android.bundle:1:1006764)\n    at DelayedFreeze (address at index.android.bundle:1:1006345)\n    at InnerScreen (address at index.android.bundle:1:1004061)\n    at anonymous (address at index.android.bundle:1:1005743)\n    at MaybeScreen (address at index.android.bundle:1:999612)\n    at RNSScreenContainer (<anonymous>)\n    at ScreenContainer (address at index.android.bundle:1:1013760)\n    at MaybeScreenContainer (address at index.android.bundle:1:999774)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at FrameSizeProvider (address at index.android.bundle:1:977463)\n    at SafeAreaProviderCompat (address at index.android.bundle:1:988905)\n    at BottomTabView (address at index.android.bundle:1:937809)\n    at PreventRemoveProvider (address at index.android.bundle:1:878590)\n    at NavigationStateListenerProvider (address at index.android.bundle:1:901233)\n    at NavigationContent (address at index.android.bundle:1:890792)\n    at anonymous (address at index.android.bundle:1:890695)\n    at BottomTabNavigator (address at index.android.bundle:1:936888)\n    at anonymous (address at index.android.bundle:1:923582)\n    at TabLayout (address at index.android.bundle:1:806019)\n    at Suspense (<anonymous>)\n    at Route (address at index.android.bundle:1:924661)\n    at BaseRoute (address at index.android.bundle:1:931551)\n    at StaticContainer (address at index.android.bundle:1:895904)\n    at EnsureSingleNavigator (address at index.android.bundle:1:840208)\n    at SceneView (address at index.android.bundle:1:893636)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at RNSScreenContentWrapper (<anonymous>)\n    at ScreenContentWrapper (<anonymous>)\n    at DebugContainer (<anonymous>)\n    at RNSScreen (<anonymous>)\n    at Animated(Anonymous) (address at index.android.bundle:1:625401)\n    at Suspender (address at index.android.bundle:1:1006703)\n    at Suspense (<anonymous>)\n    at Freeze (address at index.android.bundle:1:1006764)\n    at DelayedFreeze (address at index.android.bundle:1:1006345)\n    at InnerScreen (address at index.android.bundle:1:1004061)\n    at anonymous (address at index.android.bundle:1:1005743)\n    at ScreenStackItem (address at index.android.bundle:1:1016393)\n    at NavigationProvider (address at index.android.bundle:1:854215)\n    at SceneView (address at index.android.bundle:1:1039779)\n    at RNSScreenStack (<anonymous>)\n    at anonymous (address at index.android.bundle:1:1015471)\n    at ScreenStack (address at index.android.bundle:1:1014659)\n    at RCTView (<anonymous>)\n    at View (address at index.android.bundle:1:471984)\n    at FrameSizeProvider (address at index.android.bundle:1:977463)\n    at SafeAreaProviderCompat (address at index.android.bundle:1:988905)\n    at NativeStackView (address at index.android.bundle:1:1038339)\n    at PreventRemoveProvider (address at inde
07-17 19:27:03.074 15318 15365 E ReactNativeJS:   isComponentError: true }
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager: Unhandled SoftException
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager: java.lang.IllegalStateException: addViewAt: cannot insert view [2620] into parent [2626]: View already has a parent: [2640]  Parent: ReactViewGroup View: ReactTextView
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.fabric.mounting.SurfaceMountingManager.addViewAt(SurfaceMountingManager.java:384)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.fabric.mounting.mountitems.IntBufferBatchMountItem.execute(IntBufferBatchMountItem.kt:111)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.fabric.mounting.MountItemDispatcher.executeOrEnqueue(MountItemDispatcher.kt:312)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.fabric.mounting.MountItemDispatcher.dispatchMountItems(MountItemDispatcher.kt:221)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.fabric.mounting.MountItemDispatcher.tryDispatchMountItems(MountItemDispatcher.kt:88)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.fabric.FabricUIManager$DispatchUIFrameCallback.doFrameGuarded(FabricUIManager.java:1484)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.uimanager.GuardedFrameCallback.doFrame(GuardedFrameCallback.kt:25)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.modules.core.ReactChoreographer.frameCallback$lambda$1(ReactChoreographer.kt:59)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.modules.core.ReactChoreographer.$r8$lambda$nSkFhrr5T7rop_XKwzlLov4NLLw(ReactChoreographer.kt:0)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.facebook.react.modules.core.ReactChoreographer$$ExternalSyntheticLambda0.doFrame(D8$$SyntheticClass:0)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1399)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1410)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.view.Choreographer.doCallbacks(Choreographer.java:1012)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.view.Choreographer.doFrame(Choreographer.java:938)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.view.Choreographer$FrameDisplayEventReceiver.run(Choreographer.java:1384)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.os.Handler.handleCallback(Handler.java:958)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.os.Handler.dispatchMessage(Handler.java:99)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.os.Looper.loopOnce(Looper.java:205)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.os.Looper.loop(Looper.java:294)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at android.app.ActivityThread.main(ActivityThread.java:8492)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at java.lang.reflect.Method.invoke(Native Method)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:640)
07-17 19:27:03.127 15318 15318 E unknown:SurfaceMountingManager:        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1026)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: caught exception, displaying mount state
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher: java.lang.IllegalStateException: addViewAt: failed to insert view [2620] into parent [2626] at index 0
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.mounting.SurfaceMountingManager.addViewAt(SurfaceMountingManager.java:410)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.mounting.mountitems.IntBufferBatchMountItem.execute(IntBufferBatchMountItem.kt:111)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.mounting.MountItemDispatcher.executeOrEnqueue(MountItemDispatcher.kt:312)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.mounting.MountItemDispatcher.dispatchMountItems(MountItemDispatcher.kt:221)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.mounting.MountItemDispatcher.tryDispatchMountItems(MountItemDispatcher.kt:88)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.FabricUIManager$DispatchUIFrameCallback.doFrameGuarded(FabricUIManager.java:1484)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.uimanager.GuardedFrameCallback.doFrame(GuardedFrameCallback.kt:25)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.modules.core.ReactChoreographer.frameCallback$lambda$1(ReactChoreographer.kt:59)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.modules.core.ReactChoreographer.$r8$lambda$nSkFhrr5T7rop_XKwzlLov4NLLw(ReactChoreographer.kt:0)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.modules.core.ReactChoreographer$$ExternalSyntheticLambda0.doFrame(D8$$SyntheticClass:0)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1399)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1410)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.Choreographer.doCallbacks(Choreographer.java:1012)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.Choreographer.doFrame(Choreographer.java:938)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.Choreographer$FrameDisplayEventReceiver.run(Choreographer.java:1384)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.os.Handler.handleCallback(Handler.java:958)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.os.Handler.dispatchMessage(Handler.java:99)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.os.Looper.loopOnce(Looper.java:205)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.os.Looper.loop(Looper.java:294)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.app.ActivityThread.main(ActivityThread.java:8492)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at java.lang.reflect.Method.invoke(Native Method)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:640)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1026)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher: Caused by: java.lang.IllegalStateException: The specified child already has a parent. You must call removeView() on the child's parent first.
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.ViewGroup.addViewInner(ViewGroup.java:5508)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.ViewGroup.addView(ViewGroup.java:5314)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at android.view.ViewGroup.addView(ViewGroup.java:5254)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.views.view.ReactClippingViewManager.addView(ReactClippingViewManager.kt:36)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.views.view.ReactClippingViewManager.addView(ReactClippingViewManager.kt:20)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   at com.facebook.react.fabric.mounting.SurfaceMountingManager.addViewAt(SurfaceMountingManager.java:407)
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher:   ... 22 more
07-17 19:27:03.130 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: next mountItem triggered exception!
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: IntBufferBatchMountItem [surface:1]:
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3044]->[3050] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3050]->[3052] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3052]->[3054] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3028]->[3030] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3034]->[3036] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3018]->[3042] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3022]->[3042] @1
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3030]->[3042] @2
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3036]->[3042] @3
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3056]->[3060] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3054]->[3060] @1
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3042]->[3060] @2
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3060]->[3062] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [3062]->[2614] @1
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2630]->[2636] @0
07-17 19:27:03.154 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2636]->[2640] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2620]->[2640] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: CREATE [2626] - layoutable:1 - RCTView
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [2626]->[2640] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [2620]->[2626] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: INSERT [2630]->[2640] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2456]->[2458] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2464]->[2468] @4
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2458]->[2468] @3
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2452]->[2468] @2
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2446]->[2468] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2442]->[2468] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2468]->[266] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [308]->[310] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [310]->[312] @5
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [302]->[312] @4
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [304]->[312] @3
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [296]->[312] @2
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [298]->[312] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [290]->[312] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [320]->[322] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [316]->[322] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [330]->[332] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [326]->[332] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [342]->[344] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [338]->[344] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [280]->[284] @3
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [274]->[284] @2
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [268]->[284] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [270]->[284] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [284]->[286] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [286]->[348] @5
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [344]->[348] @4
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [332]->[348] @3
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [322]->[348] @2
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [346]->[348] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [312]->[348] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [398]->[404] @6
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [400]->[404] @5
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [392]->[404] @4
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [394]->[404] @3
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [386]->[404] @2
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [388]->[404] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [380]->[404] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [412]->[414] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [408]->[414] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [422]->[424] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [418]->[424] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [434]->[436] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [430]->[436] @0
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [364]->[368] @3
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [358]->[368] @2
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [352]->[368] @1
07-17 19:27:03.155 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [354]->[368] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [368]->[370] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [370]->[440] @5
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [436]->[440] @4
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [424]->[440] @3
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [414]->[440] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [438]->[440] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [404]->[440] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [440]->[446] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [348]->[446] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [266]->[446] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [446]->[448] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [448]->[450] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [30]->[32] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [36]->[38] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [42]->[44] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [52]->[54] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [58]->[60] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [60]->[66] @7
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [54]->[66] @6
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [62]->[66] @5
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [64]->[66] @4
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [44]->[66] @3
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [38]->[66] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [32]->[66] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [24]->[66] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [66]->[78] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [450]->[78] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [74]->[78] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [78]->[80] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2126]->[2128] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2178]->[2182] @6
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2174]->[2182] @5
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2180]->[2182] @4
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2168]->[2182] @3
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2162]->[2182] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2156]->[2182] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2158]->[2182] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2216]->[2218] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2212]->[2218] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2218]->[2220] @4
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2206]->[2220] @3
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2200]->[2220] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2194]->[2220] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2196]->[2220] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2244]->[2246] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2240]->[2246] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2246]->[2248] @4
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2234]->[2248] @3
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2228]->[2248] @2
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2222]->[2248] @1
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2224]->[2248] @0
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2248]->[2254] @9
07-17 19:27:03.156 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2220]->[2254] @8
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2190]->[2254] @7
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2252]->[2254] @6
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2182]->[2254] @5
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2152]->[2254] @4
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2186]->[2254] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2142]->[2254] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2138]->[2254] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2144]->[2254] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2254]->[2256] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2256]->[2258] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2258]->[2120] @4
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2132]->[2120] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2128]->[2120] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2134]->[2120] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2116]->[2120] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2120]->[2122] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [976]->[978] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [994]->[998] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [988]->[998] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [982]->[998] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [978]->[998] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1004]->[1006] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1022]->[1026] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1016]->[1026] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1010]->[1026] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1006]->[1026] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1026]->[962] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [998]->[962] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [962]->[964] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [964]->[966] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [940]->[942] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [946]->[948] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [948]->[954] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [942]->[954] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [934]->[954] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [930]->[954] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [954]->[972] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [966]->[972] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [968]->[972] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [972]->[974] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1188]->[1192] @4
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1184]->[1192] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1180]->[1192] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1174]->[1192] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1176]->[1192] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1212]->[1216] @4
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1208]->[1216] @3
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1204]->[1216] @2
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1198]->[1216] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1200]->[1216] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1216]->[1158] @1
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1192]->[1158] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1158]->[1160] @0
07-17 19:27:03.157 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1160]->[1162] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1122]->[1124] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1134]->[1136] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1140]->[1142] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1142]->[1148] @3
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1136]->[1148] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1128]->[1148] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1124]->[1148] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1148]->[1168] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1162]->[1168] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1164]->[1168] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1168]->[1170] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1772]->[1774] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1828]->[1830] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1834]->[1836] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1840]->[1842] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1856]->[1858] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1858]->[1860] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1852]->[1860] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1848]->[1860] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1932]->[1934] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1928]->[1934] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1924]->[1934] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1946]->[1948] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1942]->[1948] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1938]->[1948] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1960]->[1962] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1956]->[1962] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1952]->[1962] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1980]->[1984] @4
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1982]->[1984] @3
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1974]->[1984] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1970]->[1984] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1966]->[1984] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1996]->[1998] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1992]->[1998] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1988]->[1998] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2010]->[2012] @2
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2006]->[2012] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2002]->[2012] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2020]->[2022] @1
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2016]->[2022] @0
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2034]->[2042] @38
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2026]->[2042] @37
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2022]->[2042] @36
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2012]->[2042] @35
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1998]->[2042] @34
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1984]->[2042] @33
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1962]->[2042] @32
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1948]->[2042] @31
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1934]->[2042] @30
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1916]->[2042] @29
07-17 19:27:03.158 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1912]->[2042] @28
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1906]->[2042] @27
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1902]->[2042] @26
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1896]->[2042] @25
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1892]->[2042] @24
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1888]->[2042] @23
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1920]->[2042] @22
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1882]->[2042] @21
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1878]->[2042] @20
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1874]->[2042] @19
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1868]->[2042] @18
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1864]->[2042] @17
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1884]->[2042] @16
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1860]->[2042] @15
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1842]->[2042] @14
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1836]->[2042] @13
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1830]->[2042] @12
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1844]->[2042] @11
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1818]->[2042] @10
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1812]->[2042] @9
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1808]->[2042] @8
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1804]->[2042] @7
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1800]->[2042] @6
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1822]->[2042] @5
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1794]->[2042] @4
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1786]->[2042] @3
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1778]->[2042] @2
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1774]->[2042] @1
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1824]->[2042] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2042]->[2044] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2044]->[2046] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1756]->[1758] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1762]->[1764] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1764]->[1770] @3
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1758]->[1770] @2
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1750]->[1770] @1
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1746]->[1770] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1770]->[556] @2
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2046]->[556] @1
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [552]->[556] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [556]->[558] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [558]->[82] @4
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [1170]->[82] @3
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [974]->[82] @2
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2122]->[82] @1
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [80]->[82] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [88]->[94] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [98]->[108] @1
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [94]->[108] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [114]->[120] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [124]->[134] @1
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [120]->[134] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [142]->[144] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [144]->[146] @0
07-17 19:27:03.159 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [146]->[148] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [152]->[154] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [154]->[156] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [156]->[162] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [148]->[162] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [168]->[174] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [178]->[188] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [174]->[188] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [198]->[204] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [208]->[218] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [204]->[218] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [218]->[224] @8
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [194]->[224] @7
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [192]->[224] @6
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [188]->[224] @5
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [162]->[224] @4
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [138]->[224] @3
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [134]->[224] @2
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [108]->[224] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [84]->[224] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [224]->[228] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [82]->[228] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [230]->[232] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [228]->[232] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3000]->[3002] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3008]->[3012] @4
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3002]->[3012] @3
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2996]->[3012] @2
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2990]->[3012] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2986]->[3012] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3012]->[2798] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2840]->[2842] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2842]->[2844] @5
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2834]->[2844] @4
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2836]->[2844] @3
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2828]->[2844] @2
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2830]->[2844] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2822]->[2844] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2852]->[2854] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2848]->[2854] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2862]->[2864] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2858]->[2864] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2874]->[2876] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2870]->[2876] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2812]->[2816] @3
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2806]->[2816] @2
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2800]->[2816] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2802]->[2816] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2816]->[2818] @0
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2818]->[2880] @5
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2876]->[2880] @4
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2864]->[2880] @3
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2854]->[2880] @2
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2878]->[2880] @1
07-17 19:27:03.160 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2844]->[2880] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2930]->[2936] @6
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2932]->[2936] @5
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2924]->[2936] @4
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2926]->[2936] @3
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2918]->[2936] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2920]->[2936] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2912]->[2936] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2944]->[2946] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2940]->[2946] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2954]->[2956] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2950]->[2956] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2966]->[2968] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2962]->[2968] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2896]->[2900] @3
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2890]->[2900] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2884]->[2900] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2886]->[2900] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2900]->[2902] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2902]->[2972] @5
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2968]->[2972] @4
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2956]->[2972] @3
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2946]->[2972] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2970]->[2972] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2936]->[2972] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2972]->[2978] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2880]->[2978] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2798]->[2978] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2978]->[2980] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2980]->[2982] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2562]->[2564] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2568]->[2570] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2574]->[2576] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2584]->[2586] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2590]->[2592] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2592]->[2598] @7
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2586]->[2598] @6
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2594]->[2598] @5
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2596]->[2598] @4
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2576]->[2598] @3
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2570]->[2598] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2564]->[2598] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2556]->[2598] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2598]->[2610] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2982]->[2610] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2606]->[2610] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2610]->[2612] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3044]->[3050] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3050]->[3052] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3052]->[3054] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3028]->[3030] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3034]->[3036] @0
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3036]->[3042] @3
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3030]->[3042] @2
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3022]->[3042] @1
07-17 19:27:03.161 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3018]->[3042] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3042]->[3060] @2
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3054]->[3060] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3056]->[3060] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3060]->[3062] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [3062]->[2614] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2612]->[2614] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2620]->[2626] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2630]->[2640] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2626]->[2640] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2646]->[2652] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2656]->[2666] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2652]->[2666] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2674]->[2676] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2676]->[2678] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2678]->[2680] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2684]->[2686] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2686]->[2688] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2688]->[2694] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2680]->[2694] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2700]->[2706] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2710]->[2720] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2706]->[2720] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2730]->[2736] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2740]->[2750] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2736]->[2750] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2750]->[2756] @8
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2726]->[2756] @7
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2724]->[2756] @6
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2720]->[2756] @5
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2694]->[2756] @4
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2670]->[2756] @3
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2666]->[2756] @2
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2640]->[2756] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2616]->[2756] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2756]->[2760] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2614]->[2760] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2762]->[2764] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2760]->[2764] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [2764]->[18] @1
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [232]->[18] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [18]->[4] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: REMOVE [4]->[1] @0
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE PROPS [2612]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE PROPS [2610]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE PROPS [2640]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [3052]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [3028]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [3034]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [3018]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [3022]: <hidden>
07-17 19:27:03.162 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [3062]: <hidden>
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [2620]: <hidden>
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE STATE [2630]: <hidden>
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE PADDING [3050]: top:0 right:0 bottom:0 left:96
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE PADDING [3042]: top:0 right:72 bottom:0 left:2
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3044]->[3050]: x:324 y:176 w:72 h:72 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3050]->[3052]: x:0 y:200 w:720 h:440 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3052]->[3054]: x:0 y:0 w:720 h:1492 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3028]->[3030]: x:0 y:0 w:48 h:50 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3034]->[3036]: x:0 y:0 w:48 h:50 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3018]->[3042]: x:32 y:109 w:48 h:50 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3022]->[3042]: x:100 y:107 w:211 h:54 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3030]->[3042]: x:560 y:109 w:48 h:50 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3036]->[3042]: x:640 y:109 w:48 h:50 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3056]->[3060]: x:0 y:0 w:720 h:1492 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3054]->[3060]: x:0 y:0 w:720 h:1492 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3042]->[3060]: x:0 y:0 w:720 h:200 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3060]->[3062]: x:0 y:0 w:720 h:1492 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [3062]->[2614]: x:0 y:0 w:720 h:1492 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [2620]->[2640]: x:5 y:4 w:52 h:48 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [2630]->[2636]: x:46 y:14 w:52 h:48 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [2626]->[2640]: x:41 y:10 w:62 h:56 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [2620]->[2626]: x:5 y:4 w:52 h:48 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE LAYOUT [2630]->[2640]: x:46 y:14 w:52 h:48 displayType:1 layoutDirection:1
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3044]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3050]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3052]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3028]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3034]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3018]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3022]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3030]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3036]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3056]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3054]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3042]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3060]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [3062]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [2626]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [2620]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: UPDATE EVENTEMITTER [2630]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2636]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2456]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2442]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2446]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2452]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2458]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2464]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2468]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [308]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [290]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [298]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [296]
07-17 19:27:03.163 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [304]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [302]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [310]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [316]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [320]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [326]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [330]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [338]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [342]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [270]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [268]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [274]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [280]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [284]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [312]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [346]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [322]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [332]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [344]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [286]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [380]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [388]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [386]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [394]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [392]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [400]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [398]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [378]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [408]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [412]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [418]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [422]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [430]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [434]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [354]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [352]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [358]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [364]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [368]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [404]
07-17 19:27:03.164 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [438]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [414]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [424]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [436]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [370]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [266]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [348]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [440]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [446]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [448]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [30]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [36]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [42]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [52]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [58]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [24]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [32]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [38]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [44]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [64]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [62]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [54]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [60]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [74]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [450]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [66]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [78]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2126]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2158]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2156]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2162]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2168]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2180]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2174]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2178]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2212]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2216]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2196]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2194]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2200]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2206]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2218]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2240]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2244]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2224]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2222]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2228]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2234]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2246]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2144]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2138]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2142]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2186]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2152]
07-17 19:27:03.165 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2182]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2252]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2190]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2220]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2248]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2254]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2256]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2116]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2134]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2128]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2132]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2258]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2120]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [976]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [978]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [982]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [988]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [994]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1004]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1006]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1010]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1016]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1022]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [998]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1026]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [962]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [964]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [940]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [946]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [930]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [934]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [942]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [948]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [968]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [966]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [954]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [972]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1176]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1174]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1180]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1184]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1188]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1200]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1198]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1204]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1208]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1212]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1192]
07-17 19:27:03.166 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1216]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1158]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1160]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1122]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1134]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1140]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1124]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1128]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1136]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1142]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1164]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1162]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1148]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1168]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1772]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1828]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1834]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1840]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1856]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1848]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1852]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1858]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1924]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1928]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1932]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1938]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1942]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1946]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1952]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1956]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1960]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1966]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1970]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1974]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1982]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1980]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1988]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1992]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1996]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2002]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2006]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2010]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2016]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2020]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1824]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1774]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1778]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1786]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1794]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1822]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1800]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1804]
07-17 19:27:03.167 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1808]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1812]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1818]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1844]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1830]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1836]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1842]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1860]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1884]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1864]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1868]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1874]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1878]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1882]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1920]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1888]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1892]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1896]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1902]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1906]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1912]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1916]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1934]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1948]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1962]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1984]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1998]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2012]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2022]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2026]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2034]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2032]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2042]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2044]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1756]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1762]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1746]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1750]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1758]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1764]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [552]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2046]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1770]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [556]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [80]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2122]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [974]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [1170]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [558]
07-17 19:27:03.168 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [88]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [94]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [98]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [114]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [120]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [124]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [142]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [144]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [146]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [152]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [154]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [148]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [156]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [168]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [174]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [178]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [198]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [204]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [208]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [84]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [108]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [134]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [138]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [162]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [188]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [192]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [194]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [218]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [82]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [224]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [228]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [230]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3000]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2986]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2990]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2996]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3002]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3008]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3012]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2840]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2822]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2830]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2828]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2836]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2834]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2842]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2848]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2852]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2858]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2862]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2870]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2874]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2802]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2800]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2806]
07-17 19:27:03.169 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2812]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2816]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2844]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2878]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2854]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2864]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2876]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2818]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2912]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2920]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2918]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2926]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2924]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2932]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2930]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2910]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2940]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2944]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2950]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2954]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2962]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2966]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2886]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2884]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2890]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2896]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2900]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2936]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2970]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2946]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2956]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2968]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2902]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2798]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2880]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2972]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2978]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2980]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2562]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2568]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2574]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2584]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2590]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2556]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2564]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2570]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2576]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2596]
07-17 19:27:03.170 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2594]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2586]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2592]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2606]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2982]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2598]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2610]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3044]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3050]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3052]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3028]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3034]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3018]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3022]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3030]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3036]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3056]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3054]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3042]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3060]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2612]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [3062]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2620]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2626]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2630]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2646]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2652]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2656]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2674]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2676]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2678]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2684]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2686]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2680]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2688]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2700]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2706]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2710]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2730]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2736]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2740]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2616]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2640]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2666]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2670]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2694]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2720]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2724]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2726]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2750]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2614]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2756]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2760]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2762]
07-17 19:27:03.171 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [232]
07-17 19:27:03.172 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [2764]
07-17 19:27:03.172 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [18]
07-17 19:27:03.172 15318 15318 E unknown:MountItemDispatcher: dispatchMountItems: mountItem: DELETE [4]
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: Views created for surface {1}:
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RootView id=1 parentTag=16908290 isRoot=true />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1026 parentTag=962 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RNCSafeAreaProvider id=4 parentTag=1 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenStack id=18 parentTag=4 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=24 parentTag=66 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=30 parentTag=32 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=32 parentTag=66 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=36 parentTag=38 isRoot=false />
07-17 19:27:03.172 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=38 parentTag=66 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=42 parentTag=44 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=44 parentTag=66 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=52 parentTag=54 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=54 parentTag=66 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=58 parentTag=60 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=60 parentTag=66 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=62 parentTag=66 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=64 parentTag=66 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=66 parentTag=78 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2116 parentTag=2120 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2120 parentTag=2122 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=74 parentTag=78 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=2122 parentTag=-1 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=78 parentTag=80 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2126 parentTag=2128 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2128 parentTag=2120 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=80 parentTag=-1 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenContainer id=82 parentTag=228 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=84 parentTag=224 isRoot=false />
07-17 19:27:03.173 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2132 parentTag=2120 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2134 parentTag=2120 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=88 parentTag=94 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2138 parentTag=2254 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2142 parentTag=2254 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=94 parentTag=108 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2144 parentTag=2254 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=98 parentTag=108 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1122 parentTag=1124 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1124 parentTag=1148 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1128 parentTag=1148 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2152 parentTag=2254 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=108 parentTag=224 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2156 parentTag=2182 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2158 parentTag=2182 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1134 parentTag=1136 isRoot=false />
07-17 19:27:03.174 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1136 parentTag=1148 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2162 parentTag=2182 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=114 parentTag=120 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1140 parentTag=1142 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1142 parentTag=1148 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=120 parentTag=134 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2168 parentTag=2182 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1148 parentTag=1168 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=124 parentTag=134 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2174 parentTag=2182 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2178 parentTag=2182 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2180 parentTag=2182 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2182 parentTag=2254 isRoot=false />
07-17 19:27:03.175 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1158 parentTag=1160 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=134 parentTag=224 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=1160 parentTag=1162 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=138 parentTag=224 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=1162 parentTag=1168 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2186 parentTag=2254 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1164 parentTag=1168 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=142 parentTag=144 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2190 parentTag=2254 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=144 parentTag=146 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1168 parentTag=1170 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2194 parentTag=2220 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=1170 parentTag=-1 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=146 parentTag=148 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=148 parentTag=162 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2196 parentTag=2220 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1174 parentTag=1192 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=152 parentTag=154 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1176 parentTag=1192 isRoot=false />
07-17 19:27:03.176 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2200 parentTag=2220 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=154 parentTag=156 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=156 parentTag=162 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1180 parentTag=1192 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2206 parentTag=2220 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1184 parentTag=1192 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=162 parentTag=224 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2212 parentTag=2218 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1188 parentTag=1192 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=168 parentTag=174 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1192 parentTag=1158 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2216 parentTag=2218 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2218 parentTag=2220 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2220 parentTag=2254 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=174 parentTag=188 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1198 parentTag=1216 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=2222 parentTag=2248 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2224 parentTag=2248 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1200 parentTag=1216 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=178 parentTag=188 isRoot=false />
07-17 19:27:03.177 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2228 parentTag=2248 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1204 parentTag=1216 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1208 parentTag=1216 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2234 parentTag=2248 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=188 parentTag=224 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1212 parentTag=1216 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=192 parentTag=224 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1216 parentTag=1158 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2240 parentTag=2246 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=194 parentTag=224 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2244 parentTag=2246 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=198 parentTag=204 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2246 parentTag=2248 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2248 parentTag=2254 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2252 parentTag=2254 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=204 parentTag=218 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2254 parentTag=2256 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=2256 parentTag=2258 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=208 parentTag=218 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=2258 parentTag=2120 isRoot=false />
07-17 19:27:03.178 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=218 parentTag=224 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=224 parentTag=228 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenContentWrapper id=228 parentTag=232 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenStackHeaderConfig id=230 parentTag=232 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=232 parentTag=-1 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=266 parentTag=446 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=268 parentTag=284 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=270 parentTag=284 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=274 parentTag=284 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=280 parentTag=284 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=284 parentTag=286 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=286 parentTag=348 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=290 parentTag=312 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=296 parentTag=312 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=298 parentTag=312 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=302 parentTag=312 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=304 parentTag=312 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=308 parentTag=310 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=310 parentTag=312 isRoot=false />
07-17 19:27:03.179 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=312 parentTag=348 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=316 parentTag=322 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=320 parentTag=322 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=322 parentTag=348 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=326 parentTag=332 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=330 parentTag=332 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=332 parentTag=348 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=338 parentTag=344 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=342 parentTag=344 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=344 parentTag=348 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=346 parentTag=348 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=348 parentTag=446 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=352 parentTag=368 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=354 parentTag=368 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=358 parentTag=368 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=364 parentTag=368 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=368 parentTag=370 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=370 parentTag=440 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <null id=378 parentTag=null isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=380 parentTag=404 isRoot=false />
07-17 19:27:03.180 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=386 parentTag=404 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=388 parentTag=404 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=392 parentTag=404 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=394 parentTag=404 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2442 parentTag=2468 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=398 parentTag=404 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2446 parentTag=2468 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=400 parentTag=404 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=404 parentTag=440 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2452 parentTag=2468 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=408 parentTag=414 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2456 parentTag=2458 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2458 parentTag=2468 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=412 parentTag=414 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=414 parentTag=440 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2464 parentTag=2468 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=418 parentTag=424 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2468 parentTag=266 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=422 parentTag=424 isRoot=false />
07-17 19:27:03.181 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=424 parentTag=440 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=430 parentTag=436 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=434 parentTag=436 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=436 parentTag=440 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=438 parentTag=440 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=440 parentTag=null isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=446 parentTag=448 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=448 parentTag=450 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=450 parentTag=78 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2556 parentTag=2598 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2562 parentTag=2564 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2564 parentTag=2598 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2568 parentTag=2570 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2570 parentTag=2598 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2574 parentTag=2576 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2576 parentTag=2598 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2584 parentTag=2586 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2586 parentTag=2598 isRoot=false />
07-17 19:27:03.182 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2590 parentTag=2592 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2592 parentTag=2598 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2594 parentTag=2598 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2596 parentTag=2598 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2598 parentTag=2610 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=552 parentTag=556 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=556 parentTag=558 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=558 parentTag=-1 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2606 parentTag=2610 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2610 parentTag=2612 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=2612 parentTag=-1 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenContainer id=2614 parentTag=2760 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2616 parentTag=2756 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2620 parentTag=2640 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2626 parentTag=2640 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2630 parentTag=2636 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2636 parentTag=2640 isRoot=false />
07-17 19:27:03.183 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2640 parentTag=2756 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2646 parentTag=2652 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2652 parentTag=2666 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2656 parentTag=2666 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2666 parentTag=2756 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2670 parentTag=2756 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2674 parentTag=2676 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2676 parentTag=2678 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2678 parentTag=2680 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2680 parentTag=2694 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2684 parentTag=2686 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2686 parentTag=2688 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2688 parentTag=2694 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2694 parentTag=2756 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1672 parentTag=null isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2700 parentTag=2706 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2706 parentTag=2720 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2710 parentTag=2720 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2720 parentTag=2756 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2724 parentTag=2756 isRoot=false />
07-17 19:27:03.184 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2726 parentTag=2756 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2730 parentTag=2736 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2736 parentTag=2750 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2740 parentTag=2750 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2750 parentTag=2756 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2756 parentTag=2760 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenContentWrapper id=2760 parentTag=2764 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RNSScreenStackHeaderConfig id=2762 parentTag=2764 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=2764 parentTag=-1 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1746 parentTag=1770 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1750 parentTag=1770 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1756 parentTag=1758 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1758 parentTag=1770 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1762 parentTag=1764 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1764 parentTag=1770 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1770 parentTag=556 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=1772 parentTag=1774 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1774 parentTag=2042 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2798 parentTag=2978 isRoot=false />
07-17 19:27:03.185 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=2800 parentTag=2816 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1778 parentTag=2042 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2802 parentTag=2816 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2806 parentTag=2816 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1786 parentTag=2042 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2812 parentTag=2816 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2816 parentTag=2818 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1794 parentTag=2042 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2818 parentTag=2880 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2822 parentTag=2844 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1800 parentTag=2042 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1804 parentTag=2042 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2828 parentTag=2844 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2830 parentTag=2844 isRoot=false />
07-17 19:27:03.186 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1808 parentTag=2042 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2834 parentTag=2844 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1812 parentTag=2042 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2836 parentTag=2844 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=2840 parentTag=2842 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1818 parentTag=2042 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2842 parentTag=2844 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2844 parentTag=2880 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1822 parentTag=2042 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1824 parentTag=2042 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2848 parentTag=2854 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1828 parentTag=1830 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2852 parentTag=2854 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1830 parentTag=2042 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2854 parentTag=2880 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1834 parentTag=1836 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2858 parentTag=2864 isRoot=false />
07-17 19:27:03.187 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1836 parentTag=2042 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2862 parentTag=2864 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1840 parentTag=1842 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2864 parentTag=2880 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1842 parentTag=2042 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1844 parentTag=2042 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2870 parentTag=2876 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1848 parentTag=1860 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2874 parentTag=2876 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1852 parentTag=1860 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2876 parentTag=2880 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2878 parentTag=2880 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1856 parentTag=1858 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2880 parentTag=2978 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1858 parentTag=1860 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1860 parentTag=2042 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=2884 parentTag=2900 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2886 parentTag=2900 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1864 parentTag=2042 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2890 parentTag=2900 isRoot=false />
07-17 19:27:03.188 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1868 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2896 parentTag=2900 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1874 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2900 parentTag=2902 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1878 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2902 parentTag=2972 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1882 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1884 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <null id=2910 parentTag=null isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1888 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2912 parentTag=2936 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1892 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2918 parentTag=2936 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1896 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2920 parentTag=2936 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2924 parentTag=2936 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1902 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2926 parentTag=2936 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1906 parentTag=2042 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2930 parentTag=2936 isRoot=false />
07-17 19:27:03.189 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2932 parentTag=2936 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1912 parentTag=2042 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2936 parentTag=2972 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1916 parentTag=2042 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2940 parentTag=2946 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1920 parentTag=2042 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2944 parentTag=2946 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2946 parentTag=2972 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1924 parentTag=1934 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2950 parentTag=2956 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1928 parentTag=1934 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2954 parentTag=2956 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1932 parentTag=1934 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2956 parentTag=2972 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1934 parentTag=2042 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1938 parentTag=1948 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2962 parentTag=2968 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1942 parentTag=1948 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2966 parentTag=2968 isRoot=false />
07-17 19:27:03.190 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2968 parentTag=2972 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1946 parentTag=1948 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2970 parentTag=2972 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1948 parentTag=2042 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2972 parentTag=null isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1952 parentTag=1962 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=930 parentTag=954 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2978 parentTag=2980 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1956 parentTag=1962 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=2980 parentTag=2982 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=934 parentTag=954 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=2982 parentTag=2610 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1960 parentTag=1962 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1962 parentTag=2042 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2986 parentTag=3012 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=940 parentTag=942 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=942 parentTag=954 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1966 parentTag=1984 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2990 parentTag=3012 isRoot=false />
07-17 19:27:03.191 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=946 parentTag=948 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1970 parentTag=1984 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=948 parentTag=954 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2996 parentTag=3012 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1974 parentTag=1984 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3000 parentTag=3002 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=954 parentTag=972 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3002 parentTag=3012 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1980 parentTag=1984 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1982 parentTag=1984 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1984 parentTag=2042 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=3008 parentTag=3012 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=962 parentTag=964 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=964 parentTag=966 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1988 parentTag=1998 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3012 parentTag=2798 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=966 parentTag=972 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=968 parentTag=972 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1992 parentTag=1998 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=3018 parentTag=3042 isRoot=false />
07-17 19:27:03.192 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=972 parentTag=974 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1996 parentTag=1998 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=974 parentTag=-1 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1998 parentTag=2042 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=3022 parentTag=3042 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTImageView id=976 parentTag=978 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=978 parentTag=998 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2002 parentTag=2012 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=3028 parentTag=3030 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=982 parentTag=998 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2006 parentTag=2012 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3030 parentTag=3042 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2010 parentTag=2012 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=3034 parentTag=3036 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=988 parentTag=998 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2012 parentTag=2042 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3036 parentTag=3042 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2016 parentTag=2022 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=994 parentTag=998 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3042 parentTag=3060 isRoot=false />
07-17 19:27:03.193 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2020 parentTag=2022 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <AndroidProgressBar id=3044 parentTag=null isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=998 parentTag=962 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2022 parentTag=2042 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2026 parentTag=2042 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3050 parentTag=3052 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1004 parentTag=1006 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=3052 parentTag=3054 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=1006 parentTag=1026 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=3054 parentTag=3060 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <null id=2032 parentTag=null isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3056 parentTag=3060 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1010 parentTag=1026 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=2034 parentTag=2042 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=3060 parentTag=3062 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RNSScreen id=3062 parentTag=null isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1016 parentTag=1026 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTView id=2042 parentTag=2044 isRoot=false />
07-17 19:27:03.194 15318 15318 E unknown:SurfaceMountingManager: <RCTScrollView id=2044 parentTag=2046 isRoot=false />
07-17 19:27:03.195 15318 15318 E unknown:SurfaceMountingManager: <RCTText id=1022 parentTag=1026 isRoot=false />
07-17 19:27:03.195 15318 15318 E unknown:SurfaceMountingManager: <AndroidSwipeRefreshLayout id=2046 parentTag=556 isRoot=false />
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager: Exception thrown when executing UIFrameGuarded
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager: java.lang.IllegalStateException: addViewAt: failed to insert view [2620] into parent [2626] at index 0
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.mounting.SurfaceMountingManager.addViewAt(SurfaceMountingManager.java:410)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.mounting.mountitems.IntBufferBatchMountItem.execute(IntBufferBatchMountItem.kt:111)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.mounting.MountItemDispatcher.executeOrEnqueue(MountItemDispatcher.kt:312)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.mounting.MountItemDispatcher.dispatchMountItems(MountItemDispatcher.kt:221)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.mounting.MountItemDispatcher.tryDispatchMountItems(MountItemDispatcher.kt:88)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.FabricUIManager$DispatchUIFrameCallback.doFrameGuarded(FabricUIManager.java:1484)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.uimanager.GuardedFrameCallback.doFrame(GuardedFrameCallback.kt:25)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.modules.core.ReactChoreographer.frameCallback$lambda$1(ReactChoreographer.kt:59)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.modules.core.ReactChoreographer.$r8$lambda$nSkFhrr5T7rop_XKwzlLov4NLLw(ReactChoreographer.kt:0)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.modules.core.ReactChoreographer$$ExternalSyntheticLambda0.doFrame(D8$$SyntheticClass:0)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1399)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1410)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.Choreographer.doCallbacks(Choreographer.java:1012)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.Choreographer.doFrame(Choreographer.java:938)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.Choreographer$FrameDisplayEventReceiver.run(Choreographer.java:1384)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.os.Handler.handleCallback(Handler.java:958)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.os.Handler.dispatchMessage(Handler.java:99)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.os.Looper.loopOnce(Looper.java:205)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.os.Looper.loop(Looper.java:294)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.app.ActivityThread.main(ActivityThread.java:8492)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at java.lang.reflect.Method.invoke(Native Method)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:640)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1026)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager: Caused by: java.lang.IllegalStateException: The specified child already has a parent. You must call removeView() on the child's parent first.
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.ViewGroup.addViewInner(ViewGroup.java:5508)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.ViewGroup.addView(ViewGroup.java:5314)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at android.view.ViewGroup.addView(ViewGroup.java:5254)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.views.view.ReactClippingViewManager.addView(ReactClippingViewManager.kt:36)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.views.view.ReactClippingViewManager.addView(ReactClippingViewManager.kt:20)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       at com.facebook.react.fabric.mounting.SurfaceMountingManager.addViewAt(SurfaceMountingManager.java:407)
07-17 19:27:03.195 15318 15318 E unknown:FabricUIManager:       ... 22 more
07-17 19:27:03.196 15318 15318 W unknown:BridgelessReact: ReactHost{0}.handleHostException(message = "addViewAt: failed to insert view [2620] into parent [2626] at index 0")
07-17 19:27:03.206 15318 15318 D AndroidRuntime: Shutting down VM
07-17 19:27:03.206 15318 15318 I Process : Sending signal. PID: 15318 SIG: 9
PS D:\Download\platform-tools-latest-windows\platform-tools> .\adb shell pidof com.maosegura.app
22279
PS D:\Download\platform-tools-latest-windows\platform-tools> .\adb logcat --pid=22279
--------- beginning of system
07-17 19:34:43.065 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.graphics.TranGraphicImpl@6cf591f from com.transsion.hubcore.graphics.ITranGraphic
07-17 19:34:43.836 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.view.TranViewImpl@7b19e25 from com.transsion.hubcore.view.ITranView
07-17 19:34:43.863 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.magellan.implement.TranMagellanViewComponentImpl@fcd2408 from com.transsion.hubcore.magellan.ITranMagellanViewComponent
07-17 19:34:43.896 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.internal.TranInternalViewImpl@1478b4 from com.transsion.hubcore.internal.ITranInternalView
07-17 19:34:43.954 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.app.TranActivityImpl@9394f67 from com.transsion.hubcore.app.ITranActivity
07-17 19:34:43.955 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.magellan.implement.TranMagellanActivityComponentImpl@34f9dbd from com.transsion.hubcore.magellan.ITranMagellanActivityComponent
--------- beginning of main
07-17 19:35:11.504 22279 22279 D CompatibilityChangeReporter: Compat change id reported: 171228096; UID 10258; state: ENABLED
07-17 19:35:11.790 22279 22827 D nativeloader: Load /data/app/~~1gCqhXe7MxSHZStfIZXQwg==/com.maosegura.app-VSgiOFWjnHBlw7CKfVJtDQ==/base.apk!/lib/armeabi-v7a/libimagepipeline.so using class loader ns clns-4 (caller=/data/app/~~1gCqhXe7MxSHZStfIZXQwg==/com.maosegura.app-VSgiOFWjnHBlw7CKfVJtDQ==/base.apk!classes2.dex): ok
07-17 19:35:11.857 22279 22828 D nativeloader: Load /data/app/~~1gCqhXe7MxSHZStfIZXQwg==/com.maosegura.app-VSgiOFWjnHBlw7CKfVJtDQ==/base.apk!/lib/armeabi-v7a/libnative-imagetranscoder.so using class loader ns clns-4 (caller=/data/app/~~1gCqhXe7MxSHZStfIZXQwg==/com.maosegura.app-VSgiOFWjnHBlw7CKfVJtDQ==/base.apk!classes2.dex): ok
07-17 19:35:11.869 22279 22283 I m.maosegura.app: Background concurrent mark compact GC freed 3524KB AllocSpace bytes, 18(428KB) LOS objects, 49% free, 6367KB/12MB, paused 2.846ms,5.217ms total 141.261ms
07-17 19:35:12.258 22279 22320 W unknown:ReactNative: StatusBarModule: Ignored status bar change, current activity is edge-to-edge.
07-17 19:35:12.258 22279 22320 W unknown:ReactNative: StatusBarModule: Ignored status bar change, current activity is edge-to-edge.
07-17 19:35:13.139 22279 22320 W unknown:ReactNative: StatusBarModule: Ignored status bar change, current activity is edge-to-edge.
07-17 19:35:13.140 22279 22320 W unknown:ReactNative: StatusBarModule: Ignored status bar change, current activity is edge-to-edge.
07-17 19:35:14.048 22279 22833 D TrafficStats: tagSocket(173) with statsTag=0xffffffff, statsUid=-1
07-17 19:35:24.981 22279 22279 D os.LiceInfo: instance successfully. com.transsion.message.bank.v1.MessageBankLice@1e4ebb9 from com.transsion.message.bank.IMessageBankLice
07-17 19:35:25.360 22279 22319 W ReactNativeJS: 'Erro ao obter token do Expo:', 'Make sure to complete the guide at https://docs.expo.dev/push-notifications/fcm-credentials/ : Default FirebaseApp is not initialized in this process com.maosegura.app. Make sure to call FirebaseApp.initializeApp(Context) first.'
07-17 19:35:39.721 22279 22279 W Choreographer: Frame time is 0.042744 ms in the future!  Check that graphics HAL is generating vsync timestamps using the correct timebase.
07-17 19:35:45.188 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.widget.TranOverScrollerImpl@ad66eab from com.transsion.hubcore.widget.ITranOverScroller
07-17 19:35:45.209 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.flingmanager.implement.TranFlingManagerImpl@6476908 from com.transsion.hubcore.flingmanager.ITranFlingManager
07-17 19:35:45.211 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.spdopts.magellan.implement.TranMagellanComponentImpl@29858a1 from com.transsion.hubcore.magellan.ITranMagellanComponent
07-17 19:35:49.490 22279 22279 W [RNScreens]: backTitleVisible prop is not available on Android
07-17 19:35:49.490 22279 22279 W [RNScreens]: disableBackButtonMenu prop is not available on Android
07-17 19:35:49.490 22279 22279 W [RNScreens]: largeTitleFontFamily prop is not available on Android
07-17 19:35:49.490 22279 22279 W [RNScreens]: backTitleFontFamily prop is not available on Android
07-17 19:35:49.491 22279 22279 W [RNScreens]: largeTitleFontWeight prop is not available on Android
07-17 19:35:49.491 22279 22279 W [RNScreens]: largeTitleHideShadow prop is not available on Android
07-17 19:35:49.554 22279 22283 I m.maosegura.app: Background young concurrent mark compact GC freed 4708KB AllocSpace bytes, 5(168KB) LOS objects, 44% free, 7085KB/12MB, paused 2.904ms,6.012ms total 237.810ms
07-17 19:35:49.802 22279 22279 D AutofillManager: view not autofillable - has multiline input type
07-17 19:35:49.803 22279 22279 D AutofillManager: view not autofillable - has multiline input type
07-17 19:35:49.832 22279 22279 D AutofillManager: view not autofillable - has multiline input type
07-17 19:35:49.843 22279 22279 D AutofillManager: view not autofillable - has multiline input type
07-17 19:35:49.848 22279 22279 D AutofillManager: view not autofillable - has multiline input type
07-17 19:35:49.850 22279 22279 D AutofillManager: view not autofillable - has multiline input type
07-17 19:36:02.910 22279 22279 D TranClassInfo: instance successfully. com.transsion.hubcore.app.TranAppImpl@987ddbb from com.transsion.hubcore.app.ITranApp
07-17 19:36:02.958 22279 22279 W WindowOnBackDispatcher: OnBackInvokedCallback is not enabled for the application.
07-17 19:36:02.958 22279 22279 W WindowOnBackDispatcher: Set 'android:enableOnBackInvokedCallback="true"' in the application manifest.
07-17 19:36:03.147 22279 22296 E OpenGLRenderer: Unable to match the desired swap behavior.
07-17 19:36:03.168 22279 23331 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692186, sSize:4657152, line = 2451
07-17 19:36:03.168 22279 23331 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692186 line = 2621
07-17 19:36:03.202 22279 22296 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692188, sSize:4657152, line = 2451
07-17 19:36:03.212 22279 23331 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692190, sSize:4657152, line = 2451
07-17 19:36:03.223 22279 23331 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692199, sSize:4657152, line = 2451
07-17 19:36:03.236 22279 23331 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692202, sSize:4657152, line = 2451
07-17 19:36:05.596 22279 22296 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692202 line = 2621
07-17 19:36:05.616 22279 22296 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692332, sSize:4657152, line = 2451
07-17 19:36:05.635 22279 22296 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692199 line = 2621
07-17 19:36:05.649 22279 22296 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692337, sSize:4657152, line = 2451
07-17 19:36:05.677 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b9229e0
07-17 19:36:05.681 22279 22296 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0x900, ui64Stamp:692190 line = 2621
07-17 19:36:05.690 22279 22296 D IMGGralloc: Gralloc Register  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692341, sSize:4657152, line = 2451
07-17 19:36:06.159 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onUserLeaveHint(activity)
07-17 19:36:06.182 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onHostPause(activity)
07-17 19:36:06.183 22279 22279 W unknown:BridgelessReact: ReactContext.onHostPause()
07-17 19:36:07.915 22279 22279 D CompatibilityChangeReporter: Compat change id reported: 78294732; UID 10258; state: ENABLED
07-17 19:36:07.940 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onHostResume(activity)
07-17 19:36:07.940 22279 22279 W unknown:BridgelessReact: ReactContext.onHostResume()
07-17 19:36:07.969 22279 22319 W ReactNativeJS: [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
07-17 19:36:07.980 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b94e6f0
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7ba042b8
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7ba00e48
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b9ff320
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b9fe178
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b9f9dd0
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b9e23c0
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b9e1478
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b96e118
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b96a870
07-17 19:36:09.132 22279 22323 W m.maosegura.app: Monitor::Inflate: Install failed 0x7b969828
07-17 19:36:09.392 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onUserLeaveHint(activity)
07-17 19:36:09.398 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onHostPause(activity)
07-17 19:36:09.398 22279 22279 W unknown:BridgelessReact: ReactContext.onHostPause()
07-17 19:36:09.610 22279 22283 I m.maosegura.app: Background concurrent mark compact GC freed 4511KB AllocSpace bytes, 2(40KB) LOS objects, 49% free, 8106KB/15MB, paused 2.783ms,8.105ms total 385.903ms
07-17 19:36:09.892 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onHostResume(activity)
07-17 19:36:09.892 22279 22279 W unknown:BridgelessReact: ReactContext.onHostResume()
07-17 19:36:10.017 22279 23468 D TrafficStats: tagSocket(180) with statsTag=0xffffffff, statsUid=-1
07-17 19:36:10.222 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onUserLeaveHint(activity)
07-17 19:36:10.240 22279 22279 W unknown:BridgelessReact: ReactHost{0}.onHostPause(activity)
07-17 19:36:10.240 22279 22279 W unknown:BridgelessReact: ReactContext.onHostPause()
07-17 19:36:11.853 22279 22292 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:689690 line = 2621
07-17 19:36:11.881 22279 22292 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:689712 line = 2621
07-17 19:36:11.884 22279 22292 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:689716 line = 2621
07-17 19:36:11.886 22279 22292 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:689714 line = 2621
07-17 19:36:11.922 22279 22296 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692341 line = 2621
07-17 19:36:11.922 22279 22296 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692337 line = 2621
07-17 19:36:11.945 22279 22279 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692332 line = 2621
07-17 19:36:11.946 22279 22279 D IMGGralloc: Gralloc Free  w:720, h:1612, f:0x101, usage:0xb00, ui64Stamp:692188 line = 2621
PS D:\Download\platform-tools-latest-windows\platform-tools>