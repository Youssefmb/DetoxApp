package com.saifouf.DetoxApp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.content.Intent;
import android.content.Context;
import android.util.Log;

public class AppBlockingModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppBlockingModule";
    private final ReactApplicationContext reactContext;

    public AppBlockingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AppBlockingModule";
    }

    @ReactMethod
    public void startAppBlockingService() {
        try {
            Intent serviceIntent = new Intent(reactContext, AppBlockingService.class);
            reactContext.startService(serviceIntent);
            Log.d(TAG, "App blocking service started");
        } catch (Exception e) {
            Log.e(TAG, "Error starting service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopAppBlockingService() {
        try {
            Intent serviceIntent = new Intent(reactContext, AppBlockingService.class);
            reactContext.stopService(serviceIntent);
            Log.d(TAG, "App blocking service stopped");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void checkUsageStatsPermission(Promise promise) {
        try {
            boolean hasPermission = hasUsageStatsPermission();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.reject("PERMISSION_ERROR", e.getMessage());
        }
    }

    private boolean hasUsageStatsPermission() {
        // Implementation to check if usage stats permission is granted
        return true; // Simplified for now
    }
}